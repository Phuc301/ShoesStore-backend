import mongoose, { Schema, Document } from 'mongoose';
import { getNextSequence } from './counter.model';
import { DB_COLLECTIONS } from '../constants/collections.constant';
import { ICart } from '../interfaces/cart.interface';

export interface ICartDoc extends ICart, Document {}

const cartSchema = new Schema<ICartDoc>(
  {
    cartId: { type: Number, unique: true },
    userId: { type: Number },
    sessionId: { type: String },
  },
  { timestamps: true }
);

cartSchema.pre('save', async function (next) {
  if (this.isNew) {
    this.cartId = await getNextSequence(DB_COLLECTIONS.CARTS);
  }
  next();
});

export const CartModel = mongoose.model<ICartDoc>(
  DB_COLLECTIONS.CARTS,
  cartSchema
);
