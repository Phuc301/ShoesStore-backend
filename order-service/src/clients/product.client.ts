import { createHttpClient } from './createHttpClient.client';

export const productServiceEndpoints = {
  GET_PRODUCTS_BY_IDS: '/product/by-ids',
};

export const productClient = createHttpClient({
  baseURL: process.env.PRODUCT_SERVICE_URL!,
});
