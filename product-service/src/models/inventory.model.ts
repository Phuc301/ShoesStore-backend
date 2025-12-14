import mongoose, { Schema, Document } from 'mongoose';
import { DB_COLLECTIONS } from '../constants/collections.constant';
import { IInventoryHistory } from '../interfaces/inventory.interface';
import { InventoryType } from '../enums/inventoryType.enum';
import { getNextSequence } from './counter.model';

export interface IInventoryHistoryDoc extends IInventoryHistory, Document {}

const InventoryHistorySchema = new Schema<IInventoryHistoryDoc>(
  {
    inventoryId: { type: Number, unique: true },
    productId: { type: Number, required: true, index: true },
    sku: { type: String },
    type: {
      type: String,
      enum: Object.values(InventoryType),
      required: true,
    },
    quantity: { type: Number, required: true },
    oldStock: { type: Number },
    newStock: { type: Number },
    note: { type: String },
    userId: { type: Number },
    referenceId: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

InventoryHistorySchema.pre<IInventoryHistoryDoc>(
  'validate',
  async function (next) {
    if (!this.inventoryId) {
      this.inventoryId = await getNextSequence(
        DB_COLLECTIONS.INVENTORY_HISTORY
      );
    }
    next();
  }
);

InventoryHistorySchema.pre<IInventoryHistoryDoc>('save', function (next) {
  if (this.type === InventoryType.Import && this.quantity < 0) {
    this.quantity = Math.abs(this.quantity);
  }
  if (this.type === InventoryType.Export && this.quantity > 0) {
    this.quantity = -Math.abs(this.quantity);
  }
  next();
});

export const InventoryHistory = mongoose.model<IInventoryHistoryDoc>(
  DB_COLLECTIONS.INVENTORY_HISTORY,
  InventoryHistorySchema
);
