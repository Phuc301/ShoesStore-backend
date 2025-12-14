import { PaymentStatus } from '../enums/paymentStatus.enum';
import { PaymentTransactionType } from '../enums/paymentTransactionType.enum';

export interface IPaymentTransaction {
  paymentTransactionId: number;
  paymentId: number;
  type: PaymentTransactionType;
  amount: number;
  status: PaymentStatus;
  providerTransactionId?: string;
  bankTransactionId?: string;
  metadata?: any;
  createdAt: Date;
}
