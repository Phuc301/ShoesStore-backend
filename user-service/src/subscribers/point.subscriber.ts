import { redisSubscriber } from '../core/redis.core';
import { PointAction } from '../enums/pointAction.enum';
import { RedisEvent } from '../enums/redisEvent.enum';
import loyaltyService from '../services/loyalty.service';

const channel = RedisEvent.POINT_ACTION;

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
    const { userId, point, reason, action } = data.body;
    if (!action) return;
    switch (action) {
      case PointAction.ADD:
        await loyaltyService.addPoints(userId, point, reason);
        break;
      case PointAction.SUBTRACT:
        await loyaltyService.deductPoints(userId, point, reason);
        break;
    }
  } catch (error) {
    console.error('Failed to process Redis message:', error);
  }
});
