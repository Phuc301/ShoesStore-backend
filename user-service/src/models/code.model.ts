import mongoose, { Schema, Document } from 'mongoose';
import { ICode } from '../interfaces/code.interface';
import { getNextSequence } from './counter.model';
import { DB_COLLECTIONS } from '../constants/collections.constant';
import { CodeType } from '../enums/codeType.enum';

export interface ICodeDoc extends ICode, Document {}

const codeSchema = new Schema<ICodeDoc>(
  {
    codeId: { type: Number, unique: true },
    userId: { type: Number, required: true },
    code: { type: String, required: true },
    type: { type: String, enum: Object.values(CodeType), required: true },
    isUsed: { type: Boolean, default: false },
    expiredAt: { type: Date, required: true },
  },
  { timestamps: true }
);

codeSchema.pre('save', async function (next) {
  if (!this.codeId) {
    this.codeId = await getNextSequence(DB_COLLECTIONS.CODES);
  }
  next();
});

export const Code = mongoose.model<ICodeDoc>(DB_COLLECTIONS.CODES, codeSchema);
