import mongoose, { Schema, Document } from 'mongoose';
import { DB_COLLECTIONS } from '../constants/collections.constant';
import { getNextSequence } from './counter.model';
import { IOrderItem } from '../interfaces/orderItem.interface';

const orderItemSchema = new Schema<IOrderItem>(
  {
    orderItemId: { type: Number, unique: true },
    orderId: { type: String, required: true },
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    subtotal: { type: Number, required: true },
  },
  { timestamps: true }
);

orderItemSchema.pre('save', async function (next) {
  if (!this.orderItemId) {
    this.orderItemId = await getNextSequence(DB_COLLECTIONS.ORDER_ITEMS);
  }
  next();
});

export const OrderItem = mongoose.model<IOrderItem>(
  DB_COLLECTIONS.ORDER_ITEMS,
  orderItemSchema
);
