export const mapPaymentMethod = (method: string): string => {
  switch (method.toLowerCase()) {
    case 'cod':
      return 'Thanh toán khi nhận hàng (COD)';
    case 'vnpay':
      return 'Thanh toán qua VNPAY';
    case 'bank':
      return 'Chuyển khoản ngân hàng';
    default:
      return method;
  }
};
