import { createHttpClient } from './createHttpClient.client';
import dotenv from 'dotenv';

dotenv.config();

export const productServiceEndpoints = {
  GET_PRODUCTS_BY_SKU: '/product/by-skus',
};

export const productClient = createHttpClient({
  baseURL: process.env.PRODUCT_SERVICE_URL!,
});
