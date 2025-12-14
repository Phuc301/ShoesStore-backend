import { DiscountType } from '../enums/discountType.enum';

export interface Voucher {
  voucherId: number;
  code: string;
  name?: string;
  description?: string;
  discountValue: number;
  discountType: DiscountType;
  usageLimit: number;
  currentUsage: number;
  minOrderValue?: number;
  maxDiscountValue?: number;
  isActive?: boolean;
  createdAt: Date;
}
