export interface IOrderItem {
  orderItemId: number;
  orderId: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  subtotal: number;
}
