import mongoose, { Schema, Document } from 'mongoose';
import { getNextSequence } from './counter.model';
import { DB_COLLECTIONS } from '../constants/collections.constant';
import { ICartItem } from '../interfaces/cartItem.interface';

export interface ICartItemDoc extends ICartItem, Document {}

const cartItemSchema = new Schema<ICartItemDoc>(
  {
    cartItemId: { type: Number, unique: true },
    cartId: { type: Number, required: true, ref: DB_COLLECTIONS.CARTS },
    productId: { type: String, required: true },
    sku: { type: String },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { timestamps: { createdAt: 'addedAt', updatedAt: 'updatedAt' } }
);

cartItemSchema.pre('save', async function (next) {
  if (this.isNew) {
    this.cartItemId = await getNextSequence(DB_COLLECTIONS.CART_ITEMS);
  }
  next();
});

export const CartItemModel = mongoose.model<ICartItemDoc>(
  DB_COLLECTIONS.CART_ITEMS,
  cartItemSchema
);
