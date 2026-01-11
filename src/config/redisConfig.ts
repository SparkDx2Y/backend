import Redis, { RedisOptions } from "ioredis";


const options: RedisOptions = {
    host: process.env.REDIS_HOST ?? '127.0.0.1',
    port: Number(process.env.REDIS_PORT ?? 6379),
};

if (process.env.REDIS_PASSWORD) {
    options.password = process.env.REDIS_PASSWORD;
}

const redis = new Redis(options)

redis.on('connect', () => {
    console.log('Redis connected successfully');
});

redis.on('error', (error) => {
    console.log('Redis connection failed', error);
});

export default redis