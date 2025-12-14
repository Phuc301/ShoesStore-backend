import mongoose, { Schema, Document } from 'mongoose';
import { DB_COLLECTIONS } from '../constants/collections.constant';
import { PaymentStatus } from '../enums/paymentStatus.enum';
import { getNextSequence } from './counter.model';
import { IPayment } from '../interfaces/payment.interface';

const paymentSchema = new Schema<IPayment>(
  {
    paymentId: { type: Number, unique: true },
    orderId: { type: String, required: true },
    method: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'VND' },
  },
  { timestamps: true }
);

paymentSchema.pre('save', async function (next) {
  if (!this.paymentId) {
    this.paymentId = await getNextSequence(DB_COLLECTIONS.PAYMENTS);
  }
  next();
});

export const Payment = mongoose.model<IPayment>(
  DB_COLLECTIONS.PAYMENTS,
  paymentSchema
);
