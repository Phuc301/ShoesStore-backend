import { CartItemModel } from '../models/cartItem.model';
import { ICartItem } from '../interfaces/cartItem.interface';
import { CartModel } from '../models/cart.model';
import {
  productClient,
  productServiceEndpoints,
} from '../clients/product.client';

const cartItemService = {
  // Add items to cart (create cart if not exists)
  addItems: async (cartId: number, items: Partial<ICartItem>[]) => {
    if (!items || items.length === 0) {
      throw new Error('No items provided');
    }
    // Ensure cart exists
    const cart = await CartModel.findOne({ cartId }).exec();
    if (!cart) {
      throw new Error(`Cart with id ${cartId} not found`);
    }
    const results = [];

    for (const data of items) {
      if (!data.productId) {
        throw new Error('Missing productId');
      }
      const { productId, sku, quantity, price } = data;
      let existingItem = await CartItemModel.findOne({
        cartId: cart.cartId,
        productId,
        sku: sku,
      });

      if (existingItem) {
        existingItem.quantity += quantity || 1;
        existingItem.price = price ?? existingItem.price;
        existingItem.updatedAt = new Date();
        await existingItem.save();
        results.push(existingItem);
      } else {
        const item = await CartItemModel.create({
          cartId: cart.cartId,
          productId,
          sku,
          quantity: quantity || 1,
          price: price || 0,
          addedAt: new Date(),
          updatedAt: new Date(),
        });
        results.push(item);
      }
    }
    const allItems = await CartItemModel.find({ cartId: cart.cartId }).exec();
    return allItems;
  },
  // Get all items in a cart
  getItemsByCart: async (cartId: number) => {
    const cartItems = await CartItemModel.find({ cartId })
      .sort({ addedAt: -1 })
      .lean();
    if (!cartItems || cartItems.length === 0) {
      return [];
    }
    console.log('Response from product service:', productServiceEndpoints.GET_PRODUCTS_BY_SKU);
    const skus = cartItems.map((item) => item.sku);

    const response = await productClient.post(
      productServiceEndpoints.GET_PRODUCTS_BY_SKU,
      { skus }
  
    );
    
    const productData = response.data.data;
  

    const result = cartItems.map((item) => {
      const productInfo = productData.find((p: any) => p.sku === item.sku);

      return {
        cartItemId: item.cartItemId,
        cartId: item.cartId,
        sku: item.sku,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        addedAt: item.addedAt,
        ...(productInfo
          ? {
              name: productInfo.name,
              image: productInfo.image,
              color: productInfo.color,
              size: productInfo.size,
              brand: productInfo.brand,
            }
          : {
              name: 'Unknown product',
              image: '',
              color: null,
              size: null,
              brand: null,
            }),
      };
    });

    return result;
  },
  // Get count of items in a cart
  getItemsCountByCart: async (cartId: number) => {
    return await CartItemModel.countDocuments({ cartId });
  },
  // Update quantity or price of item
  updateItem: async (cartItemId: number, data: Partial<ICartItem>) => {
    const item = await CartItemModel.findOneAndUpdate({ cartItemId }, data, {
      new: true,
    });
    if (!item) throw new Error('Cart item not found');
    return item;
  },
  // Remove one item
  removeItem: async (cartItemId: number) => {
    const item = await CartItemModel.findOneAndDelete({ cartItemId });
    if (!item) throw new Error('Cart item not found');
    return item;
  },
};

export default cartItemService;
