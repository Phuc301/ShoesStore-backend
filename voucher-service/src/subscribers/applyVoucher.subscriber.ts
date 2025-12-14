import { RedisEvent } from '../enums/redisEvent.enum';
import { redisSubscriber } from '../core/redis.core';
import voucherService from '../services/voucher.service';

const channel = RedisEvent.VOUCHER_APPLY;
redisSubscriber.subscribe(channel, (err, count) => {
  if (err) {
    return;
  }
});

redisSubscriber.on('message', async (chan, message) => {
  if (chan !== channel) return;
  try {
    const data = JSON.parse(message);
    if (data && data.body) {
      const { voucherId, amount, userId, orderId } = data.body;
      await voucherService.applyVoucher(voucherId, amount, userId, orderId);
    }
  } catch (e: any) {}
});
