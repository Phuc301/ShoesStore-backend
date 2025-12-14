export interface ICart {
  cartId: number;
  userId?: number;
  sessionId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
