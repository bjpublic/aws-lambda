import {
  enqueueToGameQueue,
  findConnectionGame,
  useRedis,
} from "../support/redis";

import { APIGatewayEvent } from "aws-lambda";
import { ClientGameMessage } from "../game/messages";
import { managementApi } from "../support/aws";

export const handleMessageDefault = async (event: APIGatewayEvent) => {
  const connectionId = event.requestContext.connectionId!;
  try {
    const body = event.body;
    if (!body) {
      throw new Error("Empty request");
    }
    const message = JSON.parse(body) as ClientGameMessage;
    switch (message.type) {
      case "move":
        await handleClientGameMessage(connectionId, message);
        break;
      default:
        throw new Error("Invalid request");
    }
    return { statusCode: 200 };
  } catch (error) {
    console.error({ error }, "Error in message handling");
    await managementApi
      .deleteConnection({ ConnectionId: connectionId })
      .promise();
    return { statusCode: 400 };
  }
};

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
