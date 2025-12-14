import { createHttpClient } from './createHttpClient.client';

export const userServiceEndpoints = {
  GET_ADDRESS_BY_ID: '/addresses/details',
  FIND_OR_RESIGTER_USER: '/auth/find-or-register',
  STASTS: '/users/stats',
};

export const userClient = createHttpClient({
  baseURL: process.env.USER_SERVICE_URL!,
});
