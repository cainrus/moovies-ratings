import Redis from 'ioredis';

import createError from './createError';
import {ErrorCode} from './ErrorCode';

const redisUrl = process.env.REDIS_URL;

export default async function createRedisClient() {
  if (!redisUrl) {
    throw createError("Invalid redis credentials", ErrorCode.CACHE_INIT_ERROR);
  }
  const client = new Redis(redisUrl, {
    lazyConnect: true,
  });

  client.on('error', (err: Error) => {
    console.error('Error connecting to Redis', err);
  });
  await client.connect();
  return client;
}

export type RedisClient = Awaited<ReturnType<typeof createRedisClient>>
