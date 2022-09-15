import {
  RedisClient,
  getMatchPoolSize,
  popFromMatchPool,
  putConnectionGame,
  redisForMatchLock,
} from "../support/redis";
import { gamePlayerCount, gameSeconds } from "./constants";

import { GameStart } from "./models";
import { lambda } from "../support/aws";
import randomId from "../support/randomId";

export async function doMatch(redis: RedisClient, deadlineMillis: number) {
  const matchLock = redisForMatchLock(redis);
  const hasMore = async () =>
    (await getMatchPoolSize(redis)) >= gamePlayerCount;
  while (await hasMore()) {
    if (Date.now() >= deadlineMillis) {
      await startMatchLambda();
      return;
    }
    if (!(await matchLock.acquire(deadlineMillis - Date.now()))) {
      // 매칭 잠금 획득 실패
      return;
    }
    // 매칭 잠금 획득 성공

    await matchInLock(redis, deadlineMillis);
    await matchLock.release();

    // 매칭 잠금 해제
  }
}

async function matchInLock(
  redis: RedisClient,
  deadlineMillis: number
): Promise<void> {
  for (
    let count = await getMatchPoolSize(redis);
    count >= gamePlayerCount && Date.now() < deadlineMillis;
    count -= gamePlayerCount
  ) {
    const connectionIds = await popFromMatchPool(redis, gamePlayerCount);
    const gameId = randomId();
    await Promise.all(
      connectionIds.map((connectionId) =>
        putConnectionGame(redis, connectionId, gameId, gameSeconds)
      )
    );
    console.info({ gameId, connectionIds }, "match");

    await startGameLambda({ gameId, connectionIds });
  }
}

async function startMatchLambda(): Promise<void> {
  console.info({}, "startMatchLambda");
  await lambda
    .invoke({
      FunctionName: process.env.MATCH_FUNCTION_NAME!,
      InvocationType: "Event",
      Qualifier: "$LATEST",
    })
    .promise();
}

async function startGameLambda(start: GameStart): Promise<void> {
  console.info({ start }, "startGameLambda");
  await lambda
    .invoke({
      FunctionName: process.env.GAME_FUNCTION_NAME!,
      InvocationType: "Event",
      Qualifier: "$LATEST",
      Payload: JSON.stringify(start),
    })
    .promise();
}
