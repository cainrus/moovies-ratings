import {RedisClient} from "./createRedisClient";
import createError from "./createError";
import {ErrorCode} from "./ErrorCode";

const readRedisValue = async (client: RedisClient, search: string): Promise<string|null> => {
    try {
        return await client.get(search);
    } catch (err) {
      console.error(err);
      throw createError('Error getting value from Redis', ErrorCode.CACHE_READ_ERROR);
    }
};

export default readRedisValue;
