import { redisSubscriber } from '../core/redis.core';
import { RedisEvent } from '../enums/redisEvent.enum';
import { Product } from '../models/product.model';

const channel = RedisEvent.UPLOAD_PRODUCT_IMAGE;

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
    if (data.result.added[0]) {
      await Product.findOneAndUpdate(
        { productId: data.productId },
        { imageProduct: data.result.added[0] },
        { new: true }
      );
    }
  } catch (error) {
    console.log(error);
  }
});
