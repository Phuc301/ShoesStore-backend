import { redisSubscriber } from '../core/redis.core';
import { RedisEvent } from '../enums/redisEvent.enum';
import { IColorVariant } from '../interfaces/colorVariant.interface';
import productService from '../services/product.service';

const channel = RedisEvent.UPLOAD_PRODUCT_VARIANTS;

redisSubscriber.subscribe(channel, (err, count) => {
  if (err) {
    return;
  }
});

// Listen to Redis messages
redisSubscriber.on('message', async (channelReceived, message) => {
  if (channelReceived !== channel) return;

  try {
    const data = JSON.parse(message);
    const { productId, result } = data;

    const updatedVariants: IColorVariant[] = Object.entries(result).map(
      ([sku, value]) => ({
        color: '',
        sku,
        images: (value as { added: string[] }).added || [],
        sizes: [],
      })
    );

    const product = await productService.getProductById(productId);
    if (!product) throw new Error('Product not found');

    // Merge variants
    const mergedVariants: IColorVariant[] = (() => {
      const variantMap = new Map<string, IColorVariant>();
      for (const oldVariant of product.variants || []) {
        variantMap.set(oldVariant?.sku || '', {
          color: oldVariant.color,
          sku: oldVariant.sku,
          images: (oldVariant.images || []).filter(
            (img) => !img.startsWith('blob:')
          ),
          sizes: oldVariant.sizes,
        });
      }

      for (const v of updatedVariants) {
        const existing = variantMap.get(v.sku || '');
        if (existing) {
          existing.images = [
            ...existing.images,
            ...(v.images || []).filter((img) => !img.startsWith('blob:')),
          ];
          if (v.sizes && v.sizes.length > 0) {
            existing.sizes = v.sizes;
          }
        } else {
          variantMap.set(v.sku || '', {
            color: v.color || 'unknown',
            sku: v.sku,
            images: (v.images || []).filter((img) => !img.startsWith('blob:')),
            sizes: v.sizes || [],
          });
        }
      }
      return Array.from(variantMap.values());
    })();

    await productService.updateProduct(productId, {
      variants: mergedVariants,
    });
  } catch (error) {
    console.error('Redis variant update error:', error);
  }
});
