import { redisSubscriber } from '../core/redis.core';
import { RedisEvent } from '../interfaces/redisEvent.enum';
import cartService from '../services/cart.service';

const channel = RedisEvent.CLEAR_CART;

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
    await cartService.clearCartItems(Number(data.body.cartId));
  } catch (error) {}
});
