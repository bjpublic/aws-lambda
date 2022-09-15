import { ClientAllMessage, ClientGameMessage } from "./game/messages";
import {
  enqueueToGameQueue,
  findConnectionGame,
  pushToMatchPool,
  removeConnectionGame,
  useRedis,
} from "./support/redis";

import { APIGatewayEvent } from "aws-lambda";
import { GameStart } from "./game/models";
import { doMatch } from "./game/match";
import loop from "./game/loop";
import { managementApi } from "./support/aws";
import { removeFromMatchPool } from "./support/redis";

export const handleConnect = async (event: APIGatewayEvent) => {
  return { statusCode: 200 };
};

export const handleMatch = async () => {
  await useRedis((redis) => doMatch(redis, Date.now() + 890 * 1000));
};

export const handleGame = async (start: GameStart) => {
  await loop(start);
};

export const handleMessage = async (event: APIGatewayEvent) => {
  const connectionId = event.requestContext.connectionId!;
  try {
    const body = event.body;
    if (!body) {
      throw new Error("Empty request");
    }
    await handleClientMessage(connectionId, JSON.parse(body));
    return { statusCode: 200 };
  } catch (error) {
    console.error({ error }, "Error in message handling");
    await managementApi
      .deleteConnection({ ConnectionId: connectionId })
      .promise();
    return { statusCode: 400 };
  }
};

async function handleClientMessage(
  connectionId: string,
  message: ClientAllMessage
): Promise<void> {
  switch (message.type) {
    case "match":
      await handleClientMatchMessage(connectionId);
      break;
    case "move":
      await handleClientGameMessage(connectionId, message);
      break;
    default:
      throw new Error("Invalid request");
  }
}

async function handleClientMatchMessage(connectionId: string): Promise<void> {
  console.info({ connectionId }, "handleClientMatchMessage");
  await useRedis(async (redis) => {
    await pushToMatchPool(redis, connectionId);
    await doMatch(redis, Date.now() + 20 * 1000);
  });
}

async function handleClientGameMessage(
  connectionId: string,
  message: ClientGameMessage
): Promise<void> {
  console.info({ connectionId, message }, "handleClientGameMessage");
  await useRedis(async (redis) => {
    const gameId = await findConnectionGame(redis, connectionId);
    if (gameId == null) {
      throw new Error("Invalid request");
    } else {
      await enqueueToGameQueue(redis, gameId, {
        ...message,
        connectionId,
      });
    }
  });
}

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
