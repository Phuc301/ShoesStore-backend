import { OrderStatus } from '../enums/orderStatus.enum';

export interface IOrderStatusHistory {
  orderStatusHistoryId: number;
  orderId: string;
  status: OrderStatus;
  changedAt: Date;
}
