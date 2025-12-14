import mongoose, { Schema, Document } from 'mongoose';
import { Voucher } from '../interfaces/voucher.interface';
import { getNextSequence } from './counter.model';
import { DB_COLLECTIONS } from '../constants/collections.constant';
import { generateCode } from '../utils/codeGenerator.util';
import { DiscountType } from '../enums/discountType.enum';

export interface IVoucherDoc extends Voucher, Document {}

const voucherSchema = new Schema<IVoucherDoc>(
  {
    voucherId: { type: Number, unique: true },
    code: { type: String, unique: true },
    name: { type: String },
    description: { type: String },
    discountValue: { type: Number, required: true },
    discountType: {
      type: String,
      enum: Object.values(DiscountType),
      required: true,
    },
    usageLimit: { type: Number, default: 1 },
    currentUsage: { type: Number, default: 0 },
    minOrderValue: { type: Number },
    maxDiscountValue: { type: Number },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Generate voucherId and code before saving
voucherSchema.pre('save', async function (next) {
  if (!this.voucherId) {
    this.voucherId = await getNextSequence(DB_COLLECTIONS.VOUCHERS);
  }

  if (!this.code) {
    this.code = generateCode(5);
  }

  next();
});

export const VoucherModel = mongoose.model<IVoucherDoc>(
  DB_COLLECTIONS.VOUCHERS,
  voucherSchema
);
