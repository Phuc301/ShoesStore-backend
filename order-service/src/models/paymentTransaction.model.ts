import mongoose, { Schema, Document } from 'mongoose';
import { DB_COLLECTIONS } from '../constants/collections.constant';
import { PaymentStatus } from '../enums/paymentStatus.enum';
import { PaymentTransactionType } from '../enums/paymentTransactionType.enum';
import { getNextSequence } from './counter.model';
import { IPaymentTransaction } from '../interfaces/paymentTransaction.interface';

const paymentTransactionSchema = new Schema<IPaymentTransaction>({
  paymentTransactionId: { type: Number, unique: true },
  paymentId: { type: Number, required: true },
  type: {
    type: String,
    enum: Object.values(PaymentTransactionType),
    required: true,
  },
  amount: { type: Number, required: true },
  status: { type: String, enum: Object.values(PaymentStatus), required: true },
  providerTransactionId: { type: String },
  bankTransactionId: { type: String },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

paymentTransactionSchema.pre('save', async function (next) {
  if (!this.paymentTransactionId) {
    this.paymentTransactionId = await getNextSequence(
      DB_COLLECTIONS.PAYMENT_TRANSACTIONS
    );
  }
  next();
});

export const PaymentTransaction = mongoose.model<IPaymentTransaction>(
  DB_COLLECTIONS.PAYMENT_TRANSACTIONS,
  paymentTransactionSchema
);
