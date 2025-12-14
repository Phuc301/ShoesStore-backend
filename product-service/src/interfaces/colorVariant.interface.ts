import { ISizeVariant } from './sizeVariant.interface';

export interface IColorVariant {
  color: string;
  images: string[];
  sku?: string;
  price?: number;
  stock?: number;
  sizes: ISizeVariant[];
}
