import { VNPay, HashAlgorithm, ProductCode } from 'vnpay';
import { redisClient } from '../core/redis.core';
import {
  getVietnamTimePlusMinutes,
  getVietnamTimeString,
} from '../utils/vietnamTime.util';
import { IPayment } from '../interfaces/payment.interface';
import paymentService from './payment.service';
import { PaymentTransactionType } from '../enums/paymentTransactionType.enum';
import { PaymentStatus } from '../enums/paymentStatus.enum';
import paymentTransactionService from './paymentTransaction.services';

const vnpay = new VNPay({
  tmnCode: process.env.VNPAY_TMN_CODE!,
  secureSecret: process.env.VNPAY_SECRET!,
  vnpayHost: process.env.VNPAY_HOST!,
  hashAlgorithm: HashAlgorithm.SHA512,
  loggerFn: (..._args: unknown[]): void => {},
});

const vnpayService = {
  // Create payment QR
  createPaymentQR: async (data: Partial<IPayment>) => {
    await redisClient.set(`payment:${data.paymentId}`, 'pending', 'EX', 60);
    const transaction = await paymentTransactionService.addTransaction(
      data.paymentId!,
      PaymentTransactionType.CHARGE,
      data.amount!,
      PaymentStatus.UNPAID
    );
    if (!transaction) {
      throw new Error('Failed to create payment transaction');
    }
    const vnpayResponse = vnpay.buildPaymentUrl({
      vnp_Amount: data.amount!,
      vnp_IpAddr: '127.0.0.1',
      vnp_TxnRef: data.orderId!,
      vnp_OrderInfo: JSON.stringify({
        paymentId: data.paymentId,
        transactionId: transaction.paymentTransactionId,
        orderId: data.orderId,
      }),
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: process.env.VNPAY_RETURN_URL!,
      vnp_CreateDate: parseInt(getVietnamTimeString()),
      vnp_ExpireDate: parseInt(getVietnamTimePlusMinutes(15)),
    });
    return vnpayResponse;
  },
  // Check payment
  checkPayment: async (query: any) => {
    const orderInfo = query.vnp_OrderInfo
      ? JSON.parse(query.vnp_OrderInfo as string)
      : null;

    if (
      !orderInfo ||
      !orderInfo.paymentId ||
      !orderInfo.transactionId ||
      !orderInfo.orderId
    ) {
      throw new Error('Missing required order info in vnp_OrderInfo');
    }

    const {
      paymentId,
      transactionId: paymentTransactionId,
      orderId,
    } = orderInfo;
    const vnp_TransactionStatus = query.vnp_TransactionStatus;

    if (!vnp_TransactionStatus) {
      throw new Error('Missing transaction status');
    }

    // Check if payment and transaction exist
    const [payment, transaction] = await Promise.all([
      paymentService.getPaymentById(paymentId),
      paymentTransactionService.getTransactionById(paymentTransactionId),
    ]);

    if (!payment || !transaction) {
      throw new Error('Payment or Transaction not found');
    }

    if (vnp_TransactionStatus === '00') {
      // Payment successful
      await Promise.all([
        paymentService.updatePayment(paymentId, {
          status: PaymentStatus.SUCCESS,
        }),
        paymentTransactionService.updateTransaction(paymentTransactionId, {
          providerTransactionId: query.vnp_BankTranNo,
          bankTransactionId: query.vnp_TransactionNo,
          status: PaymentStatus.SUCCESS,
        }),
      ]);
      return { status: PaymentStatus.SUCCESS, message: 'Payment successful' };
    } else {
      // Payment failed
      return { status: PaymentStatus.FAILED, message: 'Payment failed' };
    }
  },
};

export default vnpayService;
