import { createHttpClient } from './createHttpClient.client';

export const userServiceEndpoints = {
  LIST_PUBLIC_INFO: '/users/info-list',
};

export const userClient = createHttpClient({
  baseURL: process.env.USER_SERVICE_URL!,
});
