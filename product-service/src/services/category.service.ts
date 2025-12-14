import { Category } from '../models/category.model';
import { ICategory } from '../interfaces/category.interface';
import { generateSlug } from '../utils/generateSlug.util';
import { Product } from '../models/product.model';

const categoryService = {
  // Create category
  createCategory: async (data: Partial<ICategory>) => {
    if (data.isDeleted === undefined) data.isDeleted = false;

    if (!data.slug && data.name) {
      data.slug = generateSlug(data.name);
    }

    const category = await Category.create(data);
    return category;
  },
  // Get all categories (optional filter by parentId & activeOnly)
  getAllCategories: async (
    parentId?: number | null,
    activeOnly?: boolean,
    page: number = 1,
    limit: number = 4,
    noPage: boolean = false
  ) => {
    const query: any = {};
    if (parentId !== undefined) query.parentId = parentId;

    if (activeOnly === true) query.isDeleted = { $ne: true };
    else if (activeOnly === false) query.isDeleted = true;

    const skip = (page - 1) * limit;

    const categoriesQuery = Category.find(query).sort({ createdAt: -1 });
    const categories = noPage
      ? await categoriesQuery
      : await categoriesQuery.skip(skip).limit(limit);

    const total = await Category.countDocuments(query);

    const dataWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const totalProducts = await Product.countDocuments({
          categoryId: cat.categoryId,
          isDeleted: false,
        });
        return {
          ...cat.toObject(),
          totalProducts,
        };
      })
    );

    if (noPage) return dataWithCounts;

    return {
      data: dataWithCounts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
  // Get category by ID
  getCategoryById: async (categoryId: number, activeOnly?: boolean) => {
    const query: any = { categoryId };

    if (activeOnly === true) query.isDeleted = { $ne: true };
    else if (activeOnly === false) query.isDeleted = true;

    const category = await Category.findOne(query);
    if (!category) throw new Error('Category not found');
    return category;
  },
  // Update category
  updateCategory: async (categoryId: number, data: Partial<ICategory>) => {
    if (data.name && !data.slug) {
      data.slug = generateSlug(data.name);
    }

    const category = await Category.findOneAndUpdate({ categoryId }, data, {
      new: true,
    });

    if (!category) throw new Error('Category not found');
    return category;
  },
  // Toggle category status
  toggleCategoryStatus: async (categoryId: number) => {
    const category = await Category.findOne({ categoryId });
    if (!category) throw new Error('Category not found');

    category.isDeleted = !category.isDeleted;
    await category.save();

    return category;
  },
};

export default categoryService;
