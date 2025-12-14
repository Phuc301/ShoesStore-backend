import { Product } from '../models/product.model';
import { IProduct } from '../interfaces/product.interface';
import { DB_COLLECTIONS } from '../constants/collections.constant';
import { Category } from '../models/category.model';
import { Review } from '../models/review.model';
import { SortProduct } from '../enums/sortProduct.enum';

const productService = {
  // Create product
  createProduct: async (data: Partial<IProduct>) => {
    const product = new Product(data);
    await product.save();
    return product;
  },
  // Get all products
  getAllProducts: async (
    filters: {
      categories?: string[];
      brands?: string[];
      search?: string;
      isDeleted?: string;
      minPrice?: number;
      maxPrice?: number;
    },
    page: number = 1,
    limit: number = 10,
    sortBy: number = 0
  ) => {
    const query: any = {};
    // Filter categories
    const allCategories = await Category.find({ isDeleted: false });
    const slugToCategoryIdMap: Record<string, number> = {};
    allCategories.forEach((cat) => {
      slugToCategoryIdMap[cat.slug] = cat.categoryId;
    });

    if (filters.categories && filters.categories.length > 0) {
      const categoryIds = filters.categories
        .map((slug) => slugToCategoryIdMap[slug])
        .filter(Boolean);
      if (categoryIds.length > 0) query.categoryId = { $in: categoryIds };
    }

    if (filters.isDeleted !== undefined) {
      query.isDeleted = filters.isDeleted;
    }

    // Filter brands
    if (filters.brands && filters.brands.length > 0) {
      query.brand = { $in: filters.brands };
    }

    // Search
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.basePrice = {};
      if (filters.minPrice !== undefined)
        query.basePrice.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined)
        query.basePrice.$lte = filters.maxPrice;
    }

    const skip = (page - 1) * limit;

    // Sort product
    let sortOption: any = { createdAt: -1 };
    switch (sortBy) {
      case SortProduct.PriceAsc:
        sortOption = { basePrice: 1 };
        break;
      case SortProduct.PriceDesc:
        sortOption = { basePrice: -1 };
        break;
      case SortProduct.NameAsc:
        sortOption = { name: 1 };
        break;
      case SortProduct.RatingDesc:
        sortOption = { averageRating: -1 };
        break;
    }

    const [data, total] = await Promise.all([
      Product.find(query).sort(sortOption).skip(skip).limit(limit),
      Product.countDocuments(query),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
  // Get product by ID
  getProductById: async (productId: number) => {
    const product = await Product.findOne({ productId });
    if (!product) throw new Error('Product not found');
    return product;
  },
  // Get product by Slug
  getProductBySlug: async (slug: string) => {
    // Find product and category
    const result = await Product.aggregate([
      { $match: { slug, isDeleted: false } },
      {
        $lookup: {
          from: DB_COLLECTIONS.CATEGORIES,
          localField: 'categoryId',
          foreignField: 'categoryId',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          productId: 1,
          name: 1,
          slug: 1,
          brand: 1,
          description: 1,
          basePrice: 1,
          variants: 1,
          createdAt: 1,
          updatedAt: 1,
          category: {
            categoryId: '$category.categoryId',
            name: '$category.name',
            slug: '$category.slug',
          },
        },
      },
    ]);
    if (!result || result.length === 0) throw new Error('Product not found');
    const product = result[0];

    // Aggregate review stats
    const reviewStats = await Review.aggregate([
      { $match: { productId: product.productId } },
      {
        $facet: {
          // Total review count
          totalReviews: [{ $count: 'count' }],

          // Rating distribution (only from registered users)
          ratingDistribution: [
            { $match: { isGuest: false } },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
          ],

          // Count reviews by user type
          byUserType: [{ $group: { _id: '$isGuest', count: { $sum: 1 } } }],
          averageRating: [
            { $match: { isGuest: false } },
            { $group: { _id: null, avg: { $avg: '$rating' } } },
          ],
        },
      },
      {
        $project: {
          totalReviews: {
            $ifNull: [{ $arrayElemAt: ['$totalReviews.count', 0] }, 0],
          },
          ratingDistribution: 1,
          byUserType: {
            $arrayToObject: {
              $map: {
                input: '$byUserType',
                as: 't',
                in: {
                  k: { $cond: ['$$t._id', 'guest', 'user'] },
                  v: '$$t.count',
                },
              },
            },
          },
          averageRating: {
            $ifNull: [{ $arrayElemAt: ['$averageRating.avg', 0] }, 0],
          },
        },
      },
    ]);

    const stats = reviewStats[0] || {
      totalReviews: 0,
      ratingDistribution: [],
      byUserType: { guest: 0, user: 0 },
      averageRating: 0,
    };

    // Ensure fixed 1–5 star distribution (fill missing with 0)
    const fixedDistribution = [1, 2, 3, 4, 5].map((star) => {
      const found = stats.ratingDistribution.find((r: any) => r._id === star);
      return { _id: star, count: found ? found.count : 0 };
    });

    // Return final data
    return {
      ...product,
      reviewStats: {
        totalReviews: stats.totalReviews,
        ratingDistribution: fixedDistribution,
        byUserType: stats.byUserType,
        averageRating: parseFloat(stats.averageRating?.toFixed(1)),
      },
    };
  },
  // Get product by SKU
  getProductByColorSku: async (sku: string) => {
    const product = await Product.findOne(
      { 'variants.sku': sku, isDeleted: false },
      { __v: 0 }
    ).lean();

    if (!product) throw new Error('Product not found');

    let selectedVariant: any;

    if (product.variants && Array.isArray(product.variants)) {
      selectedVariant = product.variants.find((v: any) => v.sku === sku);
    }

    if (!selectedVariant) {
      throw new Error('Variant not found for this color SKU');
    }

    return {
      productId: product.productId,
      name: product.name,
      brand: product.brand,
      categoryId: product.categoryId,
      description: product.description,
      basePrice: product.basePrice,
      variant: {
        sku: selectedVariant.sku,
        color: selectedVariant.color,
        images: selectedVariant.images,
        sizes: selectedVariant.sizes.map((s: any) => ({
          sku: s.sku,
          size: s.size,
          price: s.price,
          stock: s.stock,
        })),
      },
    };
  },
  // Update product info
  updateProduct: async (productId: number, data: Partial<IProduct>) => {
    const product = await Product.findOne({ productId });
    if (!product) throw new Error('Product not found');
    if (data.variants && data.variants.length > 0) {
      for (const variant of data.variants) {
        const existingVariant =
          product.variants &&
          product.variants.find((v) => v.color === variant.color);
        if (!existingVariant) {
          product.variants && product.variants.push(variant);
        } else {
          if (variant.sizes && variant.sizes.length > 0) {
            for (const size of variant.sizes) {
              const existingSize = existingVariant.sizes.find(
                (s) => s.size === size.size
              );
              if (!existingSize) {
                existingVariant.sizes.push(size);
              } else {
                Object.assign(existingSize, size);
              }
            }
          }
          Object.assign(existingVariant, variant);
        }
      }
    }
    await product.save();
    return product;
  },
  // Update stock/price by SKU
  updateProductBySizeSku: async (
    sku: string,
    data: { stock?: number; price?: number }
  ) => {
    const product = await Product.findOne({ 'variants.sizes.sku': sku });
    if (!product) throw new Error('Product not found');

    let updated = false;
    if (product.variants && Array.isArray(product.variants)) {
      product.variants.forEach((variant) => {
        variant.sizes.forEach((size) => {
          if (size.sku === sku) {
            if (data.stock !== undefined) size.stock = data.stock;
            if (data.price !== undefined) size.price = data.price;
            updated = true;
          }
        });
      });
    }

    if (!updated) throw new Error('Variant not found');
    await product.save();

    return product;
  },
  // Toggle product status (soft delete/restore)
  toggleProductStatus: async (productId: number) => {
    const product = await Product.findOne({ productId });
    if (!product) throw new Error('Product not found');

    product.isDeleted = !product.isDeleted;
    await product.save();

    return product;
  },
  // G
  getProductsBySkus: async (skus: string[]) => {
    if (!Array.isArray(skus) || skus.length === 0) {
      throw new Error('Invalid SKU list');
    }

    const products = await Product.find({
      $or: [
        { 'variants.sku': { $in: skus } },
        { 'variants.sizes.sku': { $in: skus } },
      ],
    }).lean();

    const results = skus.map((sku) => {
      for (const product of products) {
        for (const colorVariant of product.variants || []) {
          // SKU ở cấp màu
          if (colorVariant.sku === sku) {
            return {
              sku,
              productId: product.productId,
              name: product.name,
              brand: product.brand,
              color: colorVariant.color,
              size: null,
              price: colorVariant.price || product.basePrice,
              image: colorVariant.images?.[0] || product.imageProduct,
            };
          }

          // SKU ở cấp size
          const sizeVariant = colorVariant.sizes.find((s) => s.sku === sku);
          if (sizeVariant) {
            return {
              sku,
              productId: product.productId,
              name: product.name,
              brand: product.brand,
              color: colorVariant.color,
              size: sizeVariant.size,
              price:
                sizeVariant.price || colorVariant.price || product.basePrice,
              image: colorVariant.images?.[0] || product.imageProduct,
            };
          }
        }
      }
      return { sku, error: 'Not found' };
    });

    return results;
  },
  // Get product(s) by list Product Ids
  getProductsByIds: async (productIds: number[]) => {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      throw new Error('Invalid productId list');
    }
    const products = await Product.find(
      { productId: { $in: productIds } },
      { __v: 0 }
    ).lean();

    return products;
  },
};

export default productService;
