import type { RedisOptions } from "ioredis";
import Redis from "ioredis";
import logger from "./logger";

const redis = process.env.REDIS_URL 
    ? new Redis(process.env.REDIS_URL, {
        tls: {}
      })
    : new Redis({
        host: process.env.REDIS_HOST ?? '127.0.0.1',
        port: Number(process.env.REDIS_PORT ?? 6379),
        password: process.env.REDIS_PASSWORD,
    });

redis.on('connect', () => {
    logger.info('Redis connected successfully');
});

redis.on('error', (error) => {
    logger.error('Redis connection failed', error);
});

export default redis