import mongoose, { Schema, Document } from 'mongoose';
import { ITag } from '../interfaces/tag.interface';
import { getNextSequence } from './counter.model';
import { DB_COLLECTIONS } from '../constants/collections.constant';

export interface ITagDoc extends ITag, Document {}

const tagSchema = new Schema<ITagDoc>(
  {
    tagId: { type: Number, unique: true },
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

tagSchema.pre('save', async function (next) {
  if (!this.tagId) {
    this.tagId = await getNextSequence(DB_COLLECTIONS.TAGS);
  }
  next();
});

export const Tag = mongoose.model<ITagDoc>(DB_COLLECTIONS.TAGS, tagSchema);
