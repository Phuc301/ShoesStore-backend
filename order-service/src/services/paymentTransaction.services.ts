import { PaymentStatus } from '../enums/paymentStatus.enum';
import { PaymentTransactionType } from '../enums/paymentTransactionType.enum';
import { IPaymentTransaction } from '../interfaces/paymentTransaction.interface';
import { PaymentTransaction } from '../models/paymentTransaction.model';

const paymentTransactionService = {
  // Add transaction
  addTransaction: async (
    paymentId: number,
    type: PaymentTransactionType,
    amount: number,
    status: PaymentStatus
  ) => {
    const transaction = await PaymentTransaction.create({
      paymentId,
      type,
      amount,
      status: status,
    });
    return transaction;
  },
  // Get payment transactions
  getPaymentTransactions: async (paymentId: number) => {
    return PaymentTransaction.find({ paymentId });
  },
  // Get transaction by ID
  getTransactionById: async (paymentTransactionId: number) => {
    return PaymentTransaction.findOne({ paymentTransactionId });
  },
  // Update transaction
  updateTransaction: async (
    paymentTransactionId: number,
    updates: Partial<IPaymentTransaction>
  ) => {
    return PaymentTransaction.findOneAndUpdate(
      { paymentTransactionId },
      updates,
      { new: true }
    );
  },
};

export default paymentTransactionService;
