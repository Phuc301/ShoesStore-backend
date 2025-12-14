export interface ICartItem {
  cartItemId: number;
  cartId: number;
  productId: string;
  sku: string;
  quantity: number;
  price: number;
  addedAt: Date;
  updatedAt: Date;
}
