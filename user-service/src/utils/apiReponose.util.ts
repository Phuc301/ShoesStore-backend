export const successResponse = (message: string, data?: any) => ({
  success: true,
  message,
  data: data || null,
});

export const errorResponse = (message: string, data?: any) => ({
  success: false,
  message,
  data: data || null,
});
