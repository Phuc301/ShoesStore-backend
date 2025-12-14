import { PaymentStatus } from '../enums/paymentStatus.enum';
import { IPaymentTransaction } from './paymentTransaction.interface';

export interface IPayment {
  paymentId: number;
  orderId: string;
  method: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  transactions: IPaymentTransaction[];
  createdAt: Date;
  updatedAt: Date;
}
