export interface HttpClientOptions {
  baseURL: string;
  headers?: Record<string, string>;
  timeout?: number;
}
