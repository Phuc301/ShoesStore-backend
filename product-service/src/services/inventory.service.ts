import { InventoryHistory } from '../models/inventory.model';
import { IInventoryHistory } from '../interfaces/inventory.interface';
import { Product } from '../models/product.model';
import { InventoryType } from '../enums/inventoryType.enum';

const inventoryService = {
  createInventoryRecord: async (data: Partial<IInventoryHistory>) => {
    const product = await Product.findOne({
      $or: [
        { 'variants.sku': data.sku },
        { 'variants.sizes.sku': data.sku },
        { productId: data.productId },
      ],
    });

    if (!product) throw new Error('Product not found');

    let oldStock = 0;
    let newStock = 0;
    let found = false;

    const qty = data.quantity ?? 0;

    product.variants?.forEach((variant) => {
      if (variant.sku === data.sku) {
        oldStock = variant.stock || 0;

        if (data.type === InventoryType.Adjustment) {
          newStock = qty;
        } else {
          const change = data.type === InventoryType.Export ? -qty : qty;
          if (change < 0 && oldStock < Math.abs(change)) {
            throw new Error('Not enough stock to export');
          }
          newStock = oldStock + change;
        }

        variant.stock = newStock;
        found = true;
      }

      variant.sizes?.forEach((size) => {
        if (size.sku === data.sku) {
          oldStock = size.stock || 0;

          if (data.type === InventoryType.Adjustment) {
            newStock = qty;
          } else {
            const change = data.type === InventoryType.Export ? -qty : qty;
            if (change < 0 && oldStock < Math.abs(change)) {
              throw new Error('Not enough stock to export');
            }
            newStock = oldStock + change;
          }

          size.stock = newStock;
          found = true;
        }
      });
    });

    if (!found && !data.sku) {
      oldStock =
        product.variants?.reduce((sum, variant) => {
          const colorStock = variant.stock || 0;
          const sizeStock =
            variant.sizes?.reduce((s, sz) => s + (sz.stock || 0), 0) || 0;
          return sum + colorStock + sizeStock;
        }, 0) || 0;

      if (data.type === InventoryType.Adjustment) {
        newStock = qty;
      } else {
        const change = data.type === InventoryType.Export ? -qty : qty;
        newStock = oldStock + change;
        if (newStock < 0) throw new Error('Not enough total stock to export');
      }
    } else if (!found) {
      throw new Error('SKU not found in product variants');
    }

    await product.save();

    const record = new InventoryHistory({
      ...data,
      oldStock,
      newStock,
      productId: product.productId,
    });

    await record.save();

    return record;
  },
  getAllHistory: async (
    filters: { productId?: number; sku?: string },
    page: number = 1,
    limit: number = 10
  ) => {
    const query: any = {};
    if (filters.productId) query.productId = filters.productId;
    if (filters.sku) query.sku = filters.sku;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      InventoryHistory.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      InventoryHistory.countDocuments(query),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
  bulkCreateInventoryRecords: async (records: Partial<IInventoryHistory>[]) => {
    const result: IInventoryHistory[] = [];
    for (const record of records) {
      const created = await inventoryService.createInventoryRecord(record);
      result.push(created);
    }
    return result;
  },
  checkStock: async (
    items: { sku: string; quantity: number }[]
  ): Promise<{ sku: string; available: boolean; stock: number }[]> => {
    const result: { sku: string; available: boolean; stock: number }[] = [];
    for (const item of items) {
      const product = await Product.findOne({
        $or: [{ 'variants.sku': item.sku }, { 'variants.sizes.sku': item.sku }],
      });

      if (!product) {
        result.push({ sku: item.sku, available: false, stock: 0 });
        continue;
      }

      let stock = 0;
      let found = false;

      product.variants?.forEach((variant) => {
        if (variant.sku === item.sku) {
          stock = variant.stock || 0;
          found = true;
        }
        variant.sizes?.forEach((size) => {
          if (size.sku === item.sku) {
            stock = size.stock || 0;
            found = true;
          }
        });
      });

      result.push({
        sku: item.sku,
        available: found ? stock >= item.quantity : false,
        stock,
      });
    }

    return result;
  },
};

export default inventoryService;
