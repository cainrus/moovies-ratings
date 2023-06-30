import type {RedisClient} from "./createRedisClient";
import createError from "./createError";
import {ErrorCode} from "./ErrorCode";

const ttl = 60 * 60 * 24;

const writeRedisValue = async (client: RedisClient, key: string, value: string) => {
    try {
        await client.setex(key, ttl, value);
    } catch (err) {
        console.error(err);
        throw createError(`Unable to write cache`, ErrorCode.CACHE_WRITE_ERROR);
    }
}

export default writeRedisValue;
