import { Request, Response } from 'express';
import categoryService from '../services/category.service';
import { successResponse, errorResponse } from '../utils/apiReponose.util';

const categoryController = {
  // Create category
  create: async (req: Request, res: Response) => {
    try {
      const category = await categoryService.createCategory(req.body);
      res.status(201).json(successResponse('Category created', category));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Get all categories (optional filter by parentId & activeOnly)
  getAll: async (req: Request, res: Response) => {
    try {
      const parentId = req.query.parentId
        ? Number(req.query.parentId)
        : undefined;

      const activeOnly =
        req.query.activeOnly === undefined
          ? undefined
          : req.query.activeOnly === 'true';

      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const noPage = req.query.noPage === 'true';

      const categories = await categoryService.getAllCategories(
        parentId,
        activeOnly,
        page,
        limit,
        noPage
      );

      res.status(200).json(successResponse('Categories fetched', categories));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Get category by ID
  getById: async (req: Request, res: Response) => {
    try {
      const categoryId = Number(req.params.id);
      const activeOnly =
        req.query.activeOnly === undefined
          ? undefined
          : req.query.activeOnly === 'true';
      const category = await categoryService.getCategoryById(
        categoryId,
        activeOnly
      );
      res.status(200).json(successResponse('Category fetched', category));
    } catch (err: any) {
      res.status(404).json(errorResponse(err.message));
    }
  },
  // Update category
  update: async (req: Request, res: Response) => {
    try {
      const categoryId = Number(req.params.id);
      const category = await categoryService.updateCategory(
        categoryId,
        req.body
      );
      res.status(200).json(successResponse('Category updated', category));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Toggle category status
  toggleStatus: async (req: Request, res: Response) => {
    try {
      const categoryId = Number(req.params.id);
      const category = await categoryService.toggleCategoryStatus(categoryId);

      res
        .status(200)
        .json(
          successResponse(
            category.isDeleted ? 'Category deleted' : 'Category restored',
            category
          )
        );
    } catch (err: any) {
      res.status(404).json(errorResponse(err.message));
    }
  },
};

export default categoryController;
