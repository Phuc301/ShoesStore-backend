import { OrderStatus } from '../enums/orderStatus.enum';

export interface IOrder {
  orderId: string;
  userId: number;
  addressId: number;
  voucherId?: number;
  pointsUsed: number;
  subtotal: number;
  voucherDiscount: number;
  pointsDiscount: number;
  tax: number;
  shippingFee: number;
  totalAmount: number;
  status: OrderStatus;
  paymentId: number;
  createdAt: Date;
  updatedAt: Date;
}
