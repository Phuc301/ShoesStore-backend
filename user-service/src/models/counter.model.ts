import mongoose, { Schema, Document } from "mongoose";
import { DB_COLLECTIONS } from "../constants/collections.constant";

export interface ICounter extends Document {
  _id: string; 
  seq: number;
}

const counterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export const Counter = mongoose.model<ICounter>(
  DB_COLLECTIONS.COUNTERS,
  counterSchema
);

export async function getNextSequence(collectionName: string): Promise<number> {
  const counter = await Counter.findByIdAndUpdate(
    collectionName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}
