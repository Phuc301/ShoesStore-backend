import { redisSubscriber } from '../core/redis.core';
import { RedisEvent } from '../enums/redisEvent.enum';
import { CodeType } from '../enums/codeType.enum';
import emailService from '../services/email.service';
import {
  buildAccountVerificationEmail,
  buildCodeEmail,
  buildOrderEmail,
} from '../templates/email.templates';

const channel = RedisEvent.EMAIL_NOTIFICATION;

redisSubscriber.subscribe(channel, (err, count) => {
  if (err) {
    return;
  }
});

redisSubscriber.on('message', async (chan, message) => {
  if (chan !== channel) return;
  try {
    const data = JSON.parse(message);
    switch (data.body.purpose) {
      case CodeType.ACCOUNT_VERIFICATION:
        emailService.sendMail({
          to: data.body.to,
          subject: 'Account Verification',
          html: buildAccountVerificationEmail(data.body.verificationUrl),
        });
        break;
      case CodeType.RESET_PASSWORD:
        emailService.sendMail({
          to: data.body.to,
          subject: 'Password Reset Request',
          html: buildCodeEmail('Password Reset', data.body.content),
        });
        break;
      case CodeType.CHANGE_PASSWORD:
        emailService.sendMail({
          to: data.to,
          subject: 'Change Password Request',
          html: buildCodeEmail('Change Password', data.content),
        });
        break;
      case CodeType.NEW_ORDER: {
        const { address, paymentMethod, order, items } = data.body;
        const emailHtml = buildOrderEmail(
          order.orderId,
          address.fullName,
          address.phone,
          address.userEmail,
          items || [],
          order.subtotal,
          order.voucherDiscount,
          order.pointsDiscount,
          order.tax,
          order.shippingFee,
          order.totalAmount,
          `${address.detailAddress}, ${address.street}, ${address.ward}, ${address.district}, ${address.province}`,
          order.createdAt,
          order.status,
          paymentMethod
        );

        await emailService.sendMail({
          to: address.userEmail,
          subject: `Xác nhận đơn hàng #${order.orderId}`,
          html: emailHtml,
        });

        break;
      }
    }
  } catch (error) {}
});
