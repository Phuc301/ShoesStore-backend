import axios from 'axios';
import { HttpClientOptions } from '../interfaces/httpClientOptions.interface';

export const createHttpClient = (options: HttpClientOptions) => {
  return axios.create({
    baseURL: options.baseURL,
    timeout: options.timeout || 5000,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};
