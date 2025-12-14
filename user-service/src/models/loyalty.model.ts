import mongoose, { Schema, Document } from 'mongoose';
import { ILoyaltyAction } from '../interfaces/loyalty.interface';
import { DB_COLLECTIONS } from '../constants/collections.constant';

export interface ILoyaltyDoc extends ILoyaltyAction, Document {}

const loyaltySchema = new Schema<ILoyaltyDoc>(
  {
    userId: { type: Number, required: true },
    points: { type: Number, required: true },
    reason: { type: String, required: false },
  },
  { timestamps: false }
);

export const LoyaltyAction = mongoose.model<ILoyaltyDoc>(
  DB_COLLECTIONS.LOYALTY_ACTIONS,
  loyaltySchema
);
