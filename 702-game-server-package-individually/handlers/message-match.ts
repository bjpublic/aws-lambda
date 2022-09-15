import { pushToMatchPool, useRedis } from "../support/redis";

import { APIGatewayEvent } from "aws-lambda";
import { ClientMatch } from "../game/messages";
import { doMatch } from "../game/match";
import { managementApi } from "../support/aws";

export const handleMatchMessage = async (event: APIGatewayEvent) => {
  const connectionId = event.requestContext.connectionId!;
  try {
    const body = event.body;
    if (!body) {
      throw new Error("Empty request");
    }
    const message = JSON.parse(body) as ClientMatch;
    switch (message.type) {
      case "match":
        await handleClientMatchMessage(connectionId);
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

async function handleClientMatchMessage(connectionId: string): Promise<void> {
  console.info({ connectionId }, "handleClientMatchMessage");
  await useRedis(async (redis) => {
    await pushToMatchPool(redis, connectionId);
    await doMatch(redis, Date.now() + 20 * 1000);
  });
}
