import { redisSubscriber } from '../core/redis.core';
import { InventoryType } from '../enums/inventoryType.enum';
import { RedisEvent } from '../enums/redisEvent.enum';
import inventoryService from '../services/inventory.service';

const channel = RedisEvent.UPDATE_INVENTORY;

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
    const items = data.body.items;
    const orderId = data.body.orderId;
    const cleanData = await Promise.all(
      items.map((item: any) => ({
        sku: item.sku,
        productId: item.productId,
        quantity: Number(item.quantity),
        type: InventoryType.Export,
        note: `Order #${orderId}`,
      }))
    );
    const response =
      await inventoryService.bulkCreateInventoryRecords(cleanData);
  } catch (error) {
    console.log(error);
    // Procces here incase of error, notify to order, update order cancel and so on
  }
});
