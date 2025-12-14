import { VoucherModel } from '../models/voucher.model';
import { VoucherUsageModel } from '../models/voucherUsage.model';
import { DiscountType } from '../enums/discountType.enum';

const voucherService = {
  // Create a new voucher
  createVoucher: async (data: Partial<any>) => {
    const voucher = await VoucherModel.create(data);
    return voucher;
  },
  // Get all vouchers
  getAllVouchers: async (
    page: number,
    limit: number,
    noPage: boolean,
    isActive: boolean,
    isShowAll: boolean
  ) => {
    const query: any = {};
    if (isActive) query.isActive = isActive;
    if (!isShowAll) query.currentUsage = { $lt: 10 };
    const skip = (page - 1) * limit;
    const vouchersQuery = VoucherModel.find(query).sort({ createdAt: -1 });
    const vouchers = noPage
      ? await vouchersQuery
      : await vouchersQuery.skip(skip).limit(limit);
    const total = await VoucherModel.countDocuments(query);
    const vouchersWithCount = await Promise.all(
      vouchers.map(async (voucher) => {
        const usages = await VoucherUsageModel.find({
          voucherId: voucher.voucherId,
        }).sort({ usedAt: -1 });
        return { ...voucher.toObject(), usages };
      })
    );
    return {
      data: vouchersWithCount,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
  // Get voucher by ID
  getVoucherById: async (voucherId: number) => {
    const voucher = await VoucherModel.findOne({ voucherId });
    if (!voucher) throw new Error('Voucher not found');

    const usages = await VoucherUsageModel.find({ voucherId }).sort({
      usedAt: -1,
    });
    return { ...voucher.toObject(), usages };
  },
  // Update voucher
  updateVoucher: async (voucherId: number, data: Partial<any>) => {
    const voucher = await VoucherModel.findOneAndUpdate({ voucherId }, data, {
      new: true,
    });
    if (!voucher) throw new Error('Voucher not found');
    return voucher;
  },
  // Toggle active status
  toggleVoucherStatus: async (voucherId: number) => {
    const voucher = await VoucherModel.findOne({ voucherId });
    if (!voucher) throw new Error('Voucher not found');

    voucher.isActive = !voucher.isActive;
    await voucher.save();
    return voucher;
  },
  // Apply voucher to order
  applyVoucher: async (
    voucherId: string,
    orderTotal: number,
    userId?: number,
    orderId?: string
  ) => {
    const voucher = await VoucherModel.findOne({ voucherId });
    if (!voucher) throw new Error('Voucher not found');
    if (!orderId) throw new Error('Order ID is required');
    if (!voucher.isActive) throw new Error('Voucher is not active');

    if (voucher.currentUsage >= voucher.usageLimit) {
      throw new Error('Voucher usage limit reached');
    }

    if (voucher.minOrderValue && orderTotal < voucher.minOrderValue) {
      throw new Error(`Order must be at least ${voucher.minOrderValue}`);
    }

    let discount = 0;
    if (voucher.discountType === DiscountType.PERCENTAGE) {
      discount = orderTotal * (voucher.discountValue / 100);
      if (voucher.maxDiscountValue !== undefined) {
        discount = Math.min(discount, voucher.maxDiscountValue);
      }
    } else {
      discount = Math.min(orderTotal, voucher.discountValue);
    }

    // Increment current usage
    voucher.currentUsage += 1;
    if (voucher.currentUsage >= voucher.usageLimit) {
      voucher.isActive = false;
    }
    await voucher.save();
    await VoucherUsageModel.create({
      voucherId: voucher.voucherId,
      orderId,
      userId,
      amountSaved: discount,
    });

    return {
      message: `Voucher applied successfully, you saved ${discount}}`,
      discount,
    };
  },
  cancelVoucher: async (orderId: string, userId?: number) => {
    const usage = await VoucherUsageModel.findOne({ orderId, userId });
    if (!usage) throw new Error('Voucher usage not found for this order');

    const voucher = await VoucherModel.findOne({ voucherId: usage.voucherId });
    if (voucher && voucher.currentUsage > 0) {
      voucher.currentUsage -= 1;
      await voucher.save();
    }

    await usage.deleteOne();

    return { message: 'Voucher usage canceled' };
  },
  // Get all voucher usages (optional filter by user)
  getVoucherUsages: async (voucherId?: number, userId?: number) => {
    const query: any = {};
    if (voucherId !== undefined) query.voucherId = voucherId;
    if (userId !== undefined) query.userId = userId;
    return await VoucherUsageModel.find(query).sort({ usedAt: -1 });
  },
  // Check voucher code valid
  checkVoucherCodeValid: async (code: string) => {
    const voucher = await VoucherModel.findOne({
      code: { $regex: new RegExp('^' + code + '$', 'i') },
      isActive: true,
      $expr: { $lt: ['$currentUsage', '$usageLimit'] },
    });
    return voucher ? true : false;
  },
};

export default voucherService;
