import { redisSubscriber } from '../core/redis.core';
import { PointAction } from '../enums/pointAction.enum';
import { RedisEvent } from '../enums/redisEvent.enum';
import loyaltyService from '../services/loyalty.service';
import userService from '../services/user.service';

const channel = RedisEvent.UPLOAD_URL;

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
    await userService.updateProfile(data.userId, {
      avatarUrl: data.data?.added[0],
    });
  } catch (error) {
    console.error('Failed to process Redis message:', error);
  }
});
