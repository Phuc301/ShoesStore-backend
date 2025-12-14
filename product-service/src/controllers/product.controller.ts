import { Request, Response } from 'express';
import productService from '../services/product.service';
import { successResponse, errorResponse } from '../utils/apiReponose.util';

const productController = {
  // Create
  create: async (req: Request, res: Response) => {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json(successResponse('Product created', product));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Get all (with filter + pagination)
  getAll: async (req: Request, res: Response) => {
    try {
      const {
        category,
        brand,
        search,
        isDeleted,
        page,
        limit,
        minPrice,
        maxPrice,
        sortBy,
      } = req.query;

      const filters = {
        categories: category ? (category as string).split(',') : undefined,
        brands: brand ? (brand as string).split(',') : undefined,
        search: search as string,
        isDeleted: isDeleted as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      };

      const result = await productService.getAllProducts(
        filters,
        Number(page) || 1,
        Number(limit) || 10,
        Number(sortBy) || 0
      );

      res.status(200).json(successResponse('Products fetched', result));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Get by ID
  getById: async (req: Request, res: Response) => {
    try {
      const productId = Number(req.params.id);
      const product = await productService.getProductById(productId);
      res.status(200).json(successResponse('Product fetched', product));
    } catch (err: any) {
      res.status(404).json(errorResponse(err.message));
    }
  },
  getProductBySlug: async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const result = await productService.getProductBySlug(slug);
      res.status(200).json(successResponse('Product fetched by slug', result));
    } catch (err: any) {
      res.status(404).json(errorResponse(err.message));
    }
  },
  // Get by SKU
  getProductByColorSku: async (req: Request, res: Response) => {
    try {
      const { sku } = req.params;
      const result = await productService.getProductByColorSku(sku);
      res.status(200).json(successResponse('Product fetched by SKU', result));
    } catch (err: any) {
      res.status(404).json(errorResponse(err.message));
    }
  },
  // Update product
  update: async (req: Request, res: Response) => {
    try {
      const productId = Number(req.params.id);
      const product = await productService.updateProduct(productId, req.body);
      res.status(200).json(successResponse('Product updated', product));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Update stock/price by SKU
  updateProductBySizeSku: async (req: Request, res: Response) => {
    try {
      const { sku } = req.params;
      const product = await productService.updateProductBySizeSku(
        sku,
        req.body
      );
      res.status(200).json(successResponse('Product variant updated', product));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Toggle product status
  toggleStatus: async (req: Request, res: Response) => {
    try {
      const productId = Number(req.params.id);
      const product = await productService.toggleProductStatus(productId);

      res
        .status(200)
        .json(
          successResponse(
            product.isDeleted ? 'Product deleted' : 'Product restored',
            product
          )
        );
    } catch (err: any) {
      res.status(404).json(errorResponse(err.message));
    }
  },
  getProductsBySkus: async (req: Request, res: Response) => {
    try {
      const { skus } = req.body;
      const result = await productService.getProductsBySkus(skus);
      res.status(200).json(successResponse('Products fetched by SKUs', result));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Get product(s) by list Product Ids
  getProductsByIds: async (req: Request, res: Response) => {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids)) {
        return res.status(400).json(errorResponse('Invalid IDs format'));
      }

      const products = await productService.getProductsByIds(ids);

      res.json(successResponse('Products fetched', products));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
};

export default productController;
