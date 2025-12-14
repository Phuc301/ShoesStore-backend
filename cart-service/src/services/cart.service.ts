import { CartModel } from '../models/cart.model';
import { CartItemModel } from '../models/cartItem.model';
import { ICart } from '../interfaces/cart.interface';

const cartService = {
  // Create or get existing cart
  createCart: async (data: Partial<ICart>) => {
    const { userId, sessionId } = data;

    const orConditions = [];
    if (userId) orConditions.push({ userId });
    if (sessionId) orConditions.push({ sessionId });
    const existingCart = await CartModel.findOne(
      orConditions.length > 0 ? { $or: orConditions } : {}
    );

    if (existingCart) {
      return { cart: existingCart, isNew: false };
    }

    const cart = await CartModel.create(data);
    return { cart, isNew: true };
  },
  // Get cart by userId or sessionId
  getCart: async (userId?: number, sessionId?: string) => {
    const cart = await CartModel.findOne({
      ...(userId ? { userId } : { sessionId }),
    });
    return cart;
  },
  // Clear all items from cart (checkout success)
  clearCartItems: async (cartId: number) => {
    await CartItemModel.deleteMany({ cartId });
    return true;
  },
  // Merge session cart into user cart upon login
  mergeSessionCartToUser: async (userId: number, sessionId: string) => {
    // if (!userId || !sessionId) {
    //   throw new Error('Missing userId or sessionId');
    // }

    // Fetch both carts in parallel for performance
    const [sessionCart, userCart] = await Promise.all([
      CartModel.findOne({ sessionId }),
      CartModel.findOne({ userId }),
    ]);

    // Case 1: Neither session cart nor user cart exists → create a new cart for user
    if (!sessionCart && !userCart) {
      const newCart = await CartModel.create({ userId });
      return { success: true, cart: newCart, message: 'User cart created' };
    }

    // Case 2: Session cart exists but user cart does not → transfer ownership
    if (sessionCart && !userCart) {
      sessionCart.userId = userId;
      sessionCart.sessionId = null;
      await sessionCart.save();
      return {
        success: true,
        cart: sessionCart,
        message: 'Session cart moved to user',
      };
    }

    // Case 3: Both carts exist → merge items from session cart into user cart
    if (sessionCart && userCart) {
      const sessionItems = await CartItemModel.find({
        cartId: sessionCart.cartId,
      });

      for (const item of sessionItems) {
        const existingItem = await CartItemModel.findOne({
          cartId: userCart.cartId,
          productId: item.productId,
          sku: item.sku || null,
        });

        if (existingItem) {
          // If item already exists, increase quantity
          existingItem.quantity += item.quantity;
          existingItem.updatedAt = new Date();
          await existingItem.save();
        } else {
          // Otherwise, add as a new item
          await CartItemModel.create({
            cartId: userCart.cartId,
            productId: item.productId,
            sku: item.sku || null,
            quantity: item.quantity,
            price: item.price,
            addedAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      // Remove old session cart and its items in parallel
      await Promise.all([
        CartItemModel.deleteMany({ cartId: sessionCart.cartId }),
        CartModel.deleteOne({ cartId: sessionCart.cartId }),
      ]);

      return {
        success: true,
        cart: userCart,
        message: 'Session cart merged into user cart',
      };
    }

    // Fallback case
    return { success: true, cart: userCart, message: 'Cart merged' };
  },
};

export default cartService;
