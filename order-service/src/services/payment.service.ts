import { Payment } from '../models/payment.model';
import { IPayment } from '../interfaces/payment.interface';
import { PaymentMethod } from '../enums/paymentMethod.ennum';
import vnpayService from './vnpay.service';

const paymentService = {
  // Create payment
  createPayment: async (data: Partial<IPayment>) => {
    if (
      !data.method ||
      !Object.values(PaymentMethod).includes(data.method as PaymentMethod)
    ) {
      return { success: false, message: 'Invalid payment method provided' };
    }
    const res = await Payment.create(data);
    if (data.method === PaymentMethod.COD) {
      return { success: true, data: res };
    } else if (data.method === PaymentMethod.VNPAY) {
      const qrVnPay = await vnpayService.createPaymentQR(res);
      return { success: true, data: res, url: qrVnPay };
    }
  },
  // Get all payments
  getPayments: async (
    userId?: number,
    status?: string,
    page: number = 1,
    limit: number = 10
  ) => {
    const query: any = {};
    if (userId) query.userId = userId;
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const payments = await Payment.find(query).skip(skip).limit(limit);
    const total = await Payment.countDocuments(query);

    return { data: payments, total, page, limit };
  },
  // Get payment by ID
  getPaymentById: async (paymentId: number) => {
    return Payment.findOne({ paymentId });
  },
  // Update payment
  updatePayment: async (paymentId: number, updates: Partial<IPayment>) => {
    return Payment.findOneAndUpdate({ paymentId }, updates, { new: true });
  },
};

export default paymentService;
