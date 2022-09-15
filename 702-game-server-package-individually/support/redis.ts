import { createClient } from "@redis/client";
import randomId from "./randomId";

export type RedisClient = ReturnType<typeof createClient>;

const redisUrl = `redis://${
  process.env.IS_OFFLINE ? "127.0.0.1" : process.env.REDIS_HOST
}:6379`;
const redisKeyPrefix = "lambda-playground::game";
const redisKeyMatchPool = `${redisKeyPrefix}/match-pool`;
const redisKeyMatchLock = `${redisKeyPrefix}/match-lock`;
const redisKeyPrefixConnectionGame = `${redisKeyPrefix}/connection-id/`;
const redisKeyPrefixGameQueue = `${redisKeyPrefix}/game-queue/`;

export async function useRedis<R>(
  callback: (client: RedisClient) => Promise<R>
) {
  const client = createClient({
    url: redisUrl,
    socket: { reconnectStrategy: (retries) => Math.min(retries * 50, 500) },
  });
  await client.connect();
  try {
    return await callback(client);
  } finally {
    await client.quit();
  }
}

export function getMatchPoolSize(redis: RedisClient): Promise<number> {
  return redis.SCARD(redisKeyMatchPool);
}

export async function pushToMatchPool(
  redis: RedisClient,
  connectionId: string
): Promise<void> {
  await redis.SADD(redisKeyMatchPool, connectionId);
}

export function popFromMatchPool(
  redis: RedisClient,
  popSize: number
): Promise<string[]> {
  return redis.SPOP(redisKeyMatchPool, popSize);
}

export function removeFromMatchPool(
  redis: RedisClient,
  connectionId: string
): Promise<number> {
  return redis.SREM(redisKeyMatchPool, connectionId);
}

export function redisForMatchLock(redis: RedisClient) {
  const lockId = randomId();
  async function acquire(ttlMillis: number): Promise<boolean> {
    const set = await redis.SET(redisKeyMatchLock, lockId, {
      NX: true,
      PX: ttlMillis,
    });
    console.info({ lockId, acquired: set !== null }, "잠금 획득 시도");
    return set !== null;
  }
  async function release(): Promise<void> {
    const lockOwner = await redis.GET(redisKeyMatchLock);
    if (!lockOwner) {
      throw new Error("잠금이 이미 해제됨");
    }
    if (lockOwner !== lockId) {
      throw new Error("잠금 소유자가 변경됨");
    }
    await redis.DEL(redisKeyMatchLock);
    console.info({ lockId, lockOwner }, "잠금 해제 시도");
  }
  return { acquire, release };
}

export async function putConnectionGame(
  redis: RedisClient,
  connectionId: string,
  gameId: string,
  ttlSeconds: number
): Promise<void> {
  await redis.SET(redisKeyPrefixConnectionGame + connectionId, gameId, {
    EX: ttlSeconds,
  });
}

export function findConnectionGame(
  redis: RedisClient,
  connectionId: string
): Promise<string | null> {
  return redis.GET(redisKeyPrefixConnectionGame + connectionId);
}

export async function removeConnectionGame(
  redis: RedisClient,
  connectionId: string
): Promise<void> {
  await redis.DEL(redisKeyPrefixConnectionGame + connectionId);
}

export function enqueueToGameQueue<M extends { connectionId: string }>(
  redis: RedisClient,
  gameId: string,
  message: M
): Promise<number> {
  console.info({ message }, "게임 메시지 발행");
  return redis.PUBLISH(
    redisKeyPrefixGameQueue + gameId,
    JSON.stringify(message)
  );
}

export function subscribeFromGameQueue(
  redis: RedisClient,
  gameId: string,
  queue: unknown[]
): Promise<void> {
  return redis.SUBSCRIBE(redisKeyPrefixGameQueue + gameId, (message) => {
    console.info({ message }, "게임 메시지 수신");
    queue.push(JSON.parse(message));
  });
}
