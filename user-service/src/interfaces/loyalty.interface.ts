export interface ILoyaltyAction {
  userId: number;
  points: number;        
  reason: string;        
  createdAt?: Date;
}
