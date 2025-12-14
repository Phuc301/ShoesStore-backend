import { InventoryType } from '../enums/inventoryType.enum';

export interface IInventoryHistory {
  inventoryId: number;
  productId: number;
  sku?: string;
  type: InventoryType;
  quantity: number;
  oldStock?: number;
  newStock?: number;
  note?: string;
  userId?: number;
  referenceId?: string;
  createdAt?: Date;
}
