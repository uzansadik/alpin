import { env } from "@upkick/env/server";
import IORedis from "ioredis";

export function createRedisWorkerConnection() {
  return new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
  });
}
