import mongoose, { Schema, Document } from 'mongoose';
import { ICategory } from '../interfaces/category.interface';
import { getNextSequence } from './counter.model';
import { DB_COLLECTIONS } from '../constants/collections.constant';

export interface ICategoryDoc extends ICategory, Document {}

const categorySchema = new Schema<ICategoryDoc>(
  {
    categoryId: { type: Number, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String },
    isDeleted: { type: Boolean, default: false },
    parentId: { type: Number, default: null },
  },
  { timestamps: true }
);

categorySchema.pre('save', async function (next) {
  if (!this.categoryId) {
    this.categoryId = await getNextSequence(DB_COLLECTIONS.CATEGORIES);
  }
  next();
});

export const Category = mongoose.model<ICategoryDoc>(
  DB_COLLECTIONS.CATEGORIES,
  categorySchema
);
