import Redis from 'ioredis';

const commonRedisOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  ...(process.env.REDIS_PASSWORD
    ? { password: process.env.REDIS_PASSWORD }
    : {}),
};

const redisClient = new Redis(commonRedisOptions);
const redisPublisher = new Redis(commonRedisOptions);
const redisSubscriber = new Redis(commonRedisOptions);

export { redisClient, redisPublisher, redisSubscriber };
