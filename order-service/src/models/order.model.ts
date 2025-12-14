import mongoose, { Schema, Document } from 'mongoose';
import { OrderStatus } from '../enums/orderStatus.enum';
import { DB_COLLECTIONS } from '../constants/collections.constant';
import { generateOrderId } from '../utils/generateOrderId.util';
import { IOrder } from '../interfaces/order.interface';

const orderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, unique: true },
    userId: { type: Number, required: true },
    addressId: { type: Number, required: true },
    voucherId: { type: Number },
    pointsUsed: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    voucherDiscount: { type: Number, default: 0 },
    pointsDiscount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      required: true,
      default: OrderStatus.PENDING,
    },
    paymentId: { type: Number },
  },
  { timestamps: true }
);

orderSchema.pre('save', async function (next) {
  if (!this.orderId) {
    this.orderId = generateOrderId();
  }
  next();
});

export const Order = mongoose.model<IOrder>(DB_COLLECTIONS.ORDERS, orderSchema);
