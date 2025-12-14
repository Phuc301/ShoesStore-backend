import { IColorVariant } from './colorVariant.interface';

export interface IProduct {
  productId: number;
  name: string;
  title?: string;
  brand: string;
  imageProduct: string;
  slug: string;
  categoryId: number;
  description: string;
  basePrice: number;
  averageRating?: number;
  totalReviews?: number;
  attributes?: Record<string, any>;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  variants?: IColorVariant[];
}
