import {
  enqueueToGameQueue,
  findConnectionGame,
  removeConnectionGame,
  removeFromMatchPool,
  useRedis,
} from "../support/redis";

import { APIGatewayEvent } from "aws-lambda";

export const handleDisconnect = async (event: APIGatewayEvent) => {
  const connectionId = event.requestContext.connectionId!;
  await useRedis(async (redis) => {
    await removeFromMatchPool(redis, connectionId);
    const gameId = await findConnectionGame(redis, connectionId);
    if (gameId !== null) {
      await Promise.all([
        enqueueToGameQueue(redis, gameId, { type: "disconnect", connectionId }),
        removeConnectionGame(redis, connectionId),
      ]);
    }
  });
  return { statusCode: 200 };
};
