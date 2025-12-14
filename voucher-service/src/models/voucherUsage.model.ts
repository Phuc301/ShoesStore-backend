import mongoose, { Schema, Document } from 'mongoose';
import { VoucherUsage } from '../interfaces/voucherUsage.interface';
import { getNextSequence } from './counter.model';
import { DB_COLLECTIONS } from '../constants/collections.constant';

export interface IVoucherUsageDoc extends VoucherUsage, Document {}

const voucherUsageSchema = new Schema<IVoucherUsageDoc>(
  {
    voucherUsageId: { type: Number, unique: true },
    voucherId: { type: Number, required: true },
    orderId: { type: String, required: true },
    userId: { type: Number },
    amountSaved: { type: Number },
    usedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

voucherUsageSchema.pre('save', async function (next) {
  if (!this.voucherUsageId) {
    this.voucherUsageId = await getNextSequence(DB_COLLECTIONS.VOUCHER_USAGES);
  }
  next();
});

export const VoucherUsageModel = mongoose.model<IVoucherUsageDoc>(
  DB_COLLECTIONS.VOUCHER_USAGES,
  voucherUsageSchema
);
