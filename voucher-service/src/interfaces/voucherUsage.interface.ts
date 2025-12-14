export interface VoucherUsage {
  voucherUsageId: number;
  voucherId: number;
  orderId: string;
  userId?: number;
  amountSaved?: number;
  usedAt: Date;
}
