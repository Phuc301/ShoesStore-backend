import mongoose, { Schema, Document } from 'mongoose';
import { DB_COLLECTIONS } from '../constants/collections.constant';
import { OrderStatus } from '../enums/orderStatus.enum';
import { getNextSequence } from './counter.model';
import { IOrderStatusHistory } from '../interfaces/orderStatusHistory.interface';

const orderStatusHistorySchema = new Schema<IOrderStatusHistory>({
  orderStatusHistoryId: { type: Number, unique: true },
  orderId: { type: String, required: true },
  status: { type: String, enum: Object.values(OrderStatus), required: true },
  changedAt: { type: Date, default: Date.now },
});

orderStatusHistorySchema.pre('save', async function (next) {
  if (!this.orderStatusHistoryId) {
    this.orderStatusHistoryId = await getNextSequence(
      DB_COLLECTIONS.ORDER_STATUS_HISTORY
    );
  }
  next();
});

export const OrderStatusHistory = mongoose.model<IOrderStatusHistory>(
  DB_COLLECTIONS.ORDER_STATUS_HISTORY,
  orderStatusHistorySchema
);
