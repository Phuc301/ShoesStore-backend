import { Order } from '../models/order.model';
import { OrderItem } from '../models/orderItem.model';
import { OrderStatusHistory } from '../models/orderStatusHistory.model';
import { Payment } from '../models/payment.model';
import { OrderStatus } from '../enums/orderStatus.enum';
import { IOrder } from '../interfaces/order.interface';
import { IOrderItem } from '../interfaces/orderItem.interface';
import { PaymentMethod } from '../enums/paymentMethod.ennum';
import { PaymentStatus } from '../enums/paymentStatus.enum';
import paymentService from './payment.service';
import { redisPublisher } from '../core/redis.core';
import { RedisEvent } from '../enums/redisEvent.enum';
import { PointAction } from '../enums/pointAction.enum';
import { userClient, userServiceEndpoints } from '../clients/user.client';
import { CodeType } from '../enums/codeType.enum';
import { IUser } from '../interfaces/user.interface';
import { IAddress } from '../interfaces/address.interface';
import { PaymentTransaction } from '../models/paymentTransaction.model';
import { IPaymentTransaction } from '../interfaces/paymentTransaction.interface';
import moment from 'moment';
import {
  productClient,
  productServiceEndpoints,
} from '../clients/product.client';

// Helper function to publish point events to Redis
const _publishPointEvent = async (
  userId: number,
  point: number,
  reason: string,
  action: PointAction
) => {
  await redisPublisher.publish(
    RedisEvent.POINT_ACTION,
    JSON.stringify({
      body: { userId, point, reason, action },
    })
  );
};

const orderService = {
  // Create order
  createOrder: async (
    orderData: Partial<IOrder>,
    items: IOrderItem[],
    cartId: number,
    paymentMethod?: PaymentMethod
  ) => {
    if (
      paymentMethod &&
      !Object.values(PaymentMethod).includes(paymentMethod)
    ) {
      throw new Error('Invalid payment method');
    }
    // Check userId and addressId
    if (!orderData.userId || !orderData.addressId) {
      throw new Error('User ID and address ID are required');
    }
    const order = await Order.create(orderData);
    // create order items
    for (const item of items) {
      await OrderItem.create({ ...item, orderId: order.orderId });
    }
    await OrderStatusHistory.create({
      orderId: order.orderId,
      status: order.status,
    });

    // Process payment in payment service
    const payment = await paymentService.createPayment({
      orderId: order.orderId,
      amount: order.totalAmount,
      method: paymentMethod || (PaymentMethod.COD as PaymentMethod),
      status: PaymentStatus.UNPAID,
      currency: 'VND',
    });

    // Update order with paymentId
    await Order.findOneAndUpdate(
      { orderId: order.orderId },
      { paymentId: payment?.data?.paymentId }
    );

    if (!payment?.success) {
      throw new Error('Failed to create payment');
    }

    // Get email and address information
    const dataAddress = await userClient.get(
      userServiceEndpoints.GET_ADDRESS_BY_ID + `/${orderData.addressId}`
    );

    if (!dataAddress.data.success) {
      throw new Error('Failed to get address');
    }

    // Notification order created
    const emailNotificationPromise = redisPublisher.publish(
      RedisEvent.EMAIL_NOTIFICATION,
      JSON.stringify({
        body: {
          address: dataAddress.data.data,
          paymentMethod: payment?.data?.method,
          order,
          items,
          to: dataAddress.data.data.email,
          purpose: CodeType.NEW_ORDER,
        },
      })
    );

    // Clear cart
    const clearCartPromise = redisPublisher.publish(
      RedisEvent.CLEAR_CART,
      JSON.stringify({ body: { cartId } })
    );

    // Apply voucher
    let voucherUsagePromise: Promise<any> | undefined;
    if (order.voucherId) {
      voucherUsagePromise = redisPublisher.publish(
        RedisEvent.VOUCHER_APPLY,
        JSON.stringify({
          body: {
            voucherId: order.voucherId,
            orderId: order.orderId,
            userId: order.userId,
            amount: order.totalAmount,
          },
        })
      );
    }

    const updateInventory = redisPublisher.publish(
      RedisEvent.UPDATE_INVENTORY,
      JSON.stringify({
        body: {
          orderId: order.orderId,
          items,
        },
      })
    );
    // Deduct points
    if (orderData.pointsUsed && orderData.pointsUsed > 0 && order.userId) {
      _publishPointEvent(
        order.userId,
        orderData.pointsUsed,
        `Deduct points for order ${order.orderId}`,
        PointAction.SUBTRACT
      );
    }
    // Wait for both promises
    await Promise.all([
      emailNotificationPromise,
      clearCartPromise,
      updateInventory,
      voucherUsagePromise,
    ]);
    return { order, paymentUrl: payment?.url };
  },
  // Create order By guest
  createOrderByGuest: async (
    orderData: Partial<IOrder>,
    items: IOrderItem[],
    guestInfo: Partial<IUser>,
    addressInfo: Partial<IAddress>,
    cartId: number,
    paymentMethod?: PaymentMethod
  ) => {
    if (
      paymentMethod &&
      !Object.values(PaymentMethod).includes(paymentMethod)
    ) {
      throw new Error('Invalid payment method');
    }
    if (!guestInfo || !addressInfo) {
      throw new Error('Guest info and address info are required');
    }

    const dataUser = await userClient.post(
      userServiceEndpoints.FIND_OR_RESIGTER_USER,
      { guestInfo, addressInfo }
    );
    if (!dataUser.data.success) {
      throw new Error('Failed to create guest account');
    }
    const { user, address } = dataUser.data.data;
    orderData.userId = user.userId;
    orderData.addressId = address.addressId;

    return await orderService.createOrder(
      orderData,
      items,
      cartId,
      paymentMethod
    );
  },
  // Get all orders
  getOrders: async ({
    status,
    userId,
    page = 1,
    limit = 10,
    dateFilter,
    startDate,
    endDate,
    applyVoucher,
    voucherId,
  }: {
    status?: OrderStatus;
    userId?: number;
    page?: number;
    limit?: number;
    dateFilter?: 'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | 'range';
    startDate?: string;
    endDate?: string;
    applyVoucher?: boolean;
    voucherId?: string;
  }) => {
    const query: any = {};
    if (status) query.status = status;
    if (userId) query.userId = userId;
    if (applyVoucher === true) {
      query.voucherId = { $exists: true, $ne: null };
    }
    if (voucherId) {
      query.voucherId = voucherId;
    }
    if (dateFilter) {
      let start, end;

      switch (dateFilter) {
        case 'today':
          start = moment().startOf('day');
          end = moment().endOf('day');
          break;
        case 'yesterday':
          start = moment().subtract(1, 'day').startOf('day');
          end = moment().subtract(1, 'day').endOf('day');
          break;
        case 'thisWeek':
          start = moment().startOf('week');
          end = moment().endOf('week');
          break;
        case 'thisMonth':
          start = moment().startOf('month');
          end = moment().endOf('month');
          break;
        case 'range':
          if (startDate && endDate) {
            start = moment(startDate).startOf('day');
            end = moment(endDate).endOf('day');
          }
          break;
      }
      if (start && end) {
        query.createdAt = { $gte: start.toDate(), $lte: end.toDate() };
      }
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      Order.countDocuments(query),
    ]);

    const ordersWithCount = await Promise.all(
      orders.map(async (order) => {
        const itemsCount = await OrderItem.countDocuments({
          orderId: order.orderId,
        });
        return {
          ...order,
          itemsCount,
        };
      })
    );

    return {
      data: ordersWithCount,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
  // Get order by ID
  getOrderById: async (orderId: string) => {
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    const order = await Order.findOne({ orderId }).lean();
    if (!order) {
      throw new Error('Order not found');
    }

    const orderItems = await OrderItem.find({ orderId }).lean();

    const statusHistory = await OrderStatusHistory.find({ orderId })
      .sort({ createdAt: -1 })
      .lean();

    let paymentData = null;
    let transactions: IPaymentTransaction[] = [];
    if (order.paymentId) {
      paymentData = await Payment.findOne({
        paymentId: order.paymentId,
      }).lean();
      if (paymentData) {
        transactions = await PaymentTransaction.find({
          paymentId: paymentData.paymentId,
        })
          .sort({ createdAt: -1 })
          .lean();
      }
    }

    let addressData = null;
    if (order.addressId) {
      try {
        const addressRes = await userClient.get(
          `${userServiceEndpoints.GET_ADDRESS_BY_ID}/${order.addressId}`
        );
        if (addressRes.data.success) {
          addressData = addressRes.data.data;
        }
      } catch (err: any) {
        console.error('Failed to fetch address info:', err.message);
      }
    }

    return {
      order,
      items: orderItems,
      payment: paymentData ? { ...paymentData, transactions } : null,
      address: addressData,
      statusHistory,
    };
  },
  // Update order
  updateOrder: async (orderId: string, updates: Partial<IOrder>) => {
    // Update the order and return the new document
    const order = await Order.findOneAndUpdate({ orderId }, updates, {
      new: true,
    });
    if (!order) throw new Error('Order not existent');
    // Record the status change in history
    if (updates.status) {
      await OrderStatusHistory.create({ orderId, status: updates.status });
    }
    // Handle points based on order status
    switch (updates.status) {
      case OrderStatus.DELIVERED:
        if (order.userId) {
          await _publishPointEvent(
            order.userId,
            order.subtotal * 0.0001,
            `Awarding points for delivered order ${order.orderId}`,
            PointAction.ADD
          );
        }
        break;
      // case OrderStatus.CANCELLED:
      //   await _publishPointEvent(
      //     order.subtotal * 0.1,
      //     `Refund points for order ${order.orderId}`,
      //     PointAction.SUBTRACT
      //   );
      //   break;
    }
    return order;
  },
  // Delete order
  deleteOrder: async (orderId: string) => {
    await Order.deleteOne({ orderId });
    await OrderItem.deleteMany({ orderId });
    await Payment.deleteMany({ orderId });
    return { message: 'Order deleted' };
  },
  // Get Order Status Count
  getOrderStatusCount: async () => {
    const statuses = Object.values(OrderStatus);
    const result: Record<string, number> = {};

    await Promise.all(
      statuses.map(async (status) => {
        const count = await Order.countDocuments({ status });
        result[status] = count;
      })
    );

    return result;
  },
  // Get best-selling products
  getBestSellingProducts: async (limit = 5) => {
    const result = await OrderItem.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: 'orderId',
          foreignField: 'orderId',
          as: 'order',
        },
      },
      { $unwind: '$order' },
      {
        $match: {
          'order.status': { $in: [OrderStatus.DELIVERED, OrderStatus.PENDING] },
        },
      },
      {
        $group: {
          _id: '$productId',
          totalQuantity: { $sum: '$quantity' },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit },
    ]);

    const productIds = result.map((item) => item._id);

    const { data: response } = await productClient.post(
      productServiceEndpoints.GET_PRODUCTS_BY_IDS,
      { ids: productIds }
    );
    const products = response.data;

    return result.map((item) => {
      const product = products.find(
        (p: any) => p.productId === Number(item._id)
      );

      return {
        productId: item._id,
        totalQuantity: item.totalQuantity,
        product: {
          productName: product.name,
          imageProduct: product.imageProduct,
          averageRating: product.averageRating,
          basePrice: product.basePrice,
        },
      };
    });
  },
  getRevenueByStatusAndDate: async (options: {
    statuses?: OrderStatus[];
    startDate: string;
    endDate: string;
  }) => {
    const { statuses = [OrderStatus.DELIVERED], startDate, endDate } = options;

    const start = moment(startDate).startOf('day');
    const end = moment(endDate).endOf('day');

    const revenueData = await Order.aggregate([
      {
        $match: {
          status: { $in: statuses },
          createdAt: { $gte: start.toDate(), $lte: end.toDate() },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalRevenue: { $sum: '$totalAmount' },
          countOrders: { $sum: 1 },
          orders: { $push: '$orderId' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const diffDays = end.diff(start, 'days') + 1;
    const result = [];
    for (let i = 0; i < diffDays; i++) {
      const date = start.clone().add(i, 'days').format('YYYY-MM-DD');
      const dayData = revenueData.find((r) => r._id === date);
      result.push({
        date,
        totalRevenue: dayData ? dayData.totalRevenue : 0,
        countOrders: dayData ? dayData.countOrders : 0,
        orderIds: dayData ? dayData.orders : [],
      });
    }
    return result;
  },
  getMonthlyStats: async () => {
    const startCurrent = moment().startOf('month').toDate();
    const endCurrent = moment().endOf('month').toDate();

    const startPrev = moment().subtract(1, 'month').startOf('month').toDate();
    const endPrev = moment().subtract(1, 'month').endOf('month').toDate();

    const revenueStatuses = [OrderStatus.DELIVERED];

    const [totalStats] = await Order.aggregate([
      {
        $match: {
          status: { $in: revenueStatuses },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const [currentStats] = await Order.aggregate([
      {
        $match: {
          status: { $in: revenueStatuses },
          createdAt: { $gte: startCurrent, $lte: endCurrent },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const [previousStats] = await Order.aggregate([
      {
        $match: {
          status: { $in: revenueStatuses },
          createdAt: { $gte: startPrev, $lte: endPrev },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const currentRevenue = currentStats?.totalRevenue ?? 0;
    const previousRevenue = previousStats?.totalRevenue ?? 0;
    const totalRevenue = totalStats?.totalRevenue ?? 0;

    const currentOrders = currentStats?.totalOrders ?? 0;
    const previousOrders = previousStats?.totalOrders ?? 0;
    const totalOrders = totalStats?.totalOrders ?? 0;

    const calcPercent = (cur: number, prev: number) => {
      if (prev === 0) return cur > 0 ? 100 : 0;
      return Number((((cur - prev) / prev) * 100).toFixed(2));
    };
    const statsUser = await userClient.get(userServiceEndpoints.STASTS);
    return {
      revenue: {
        totalRevenue,
        current: currentRevenue,
        previous: previousRevenue,
        changePercent: calcPercent(currentRevenue, previousRevenue),
      },
      orders: {
        totalOrders,
        current: currentOrders,
        previous: previousOrders,
        changePercent: calcPercent(currentOrders, previousOrders),
      },
      ...statsUser.data.data,
    };
  },
};

export default orderService;
