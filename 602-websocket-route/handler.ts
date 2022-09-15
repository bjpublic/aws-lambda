import { APIGatewayEvent } from "aws-lambda";
import { ApiGatewayManagementApi } from "aws-sdk";

export const handleConnect = async (event: APIGatewayEvent) => {
  return { statusCode: 200 };
};

export const handleMessage = async (event: APIGatewayEvent) => {
  const connectionId = event.requestContext.connectionId!;
  const managementApi = new ApiGatewayManagementApi({
    endpoint: process.env.IS_OFFLINE
      ? "http://localhost:3001"
      : `${event.requestContext.domainName}/${event.requestContext.stage}`,
  });
  await managementApi
    .deleteConnection({ ConnectionId: connectionId })
    .promise();
  return { statusCode: 200 };
};

export const handleTalkAction = async (event: APIGatewayEvent) => {
  const connectionId = event.requestContext.connectionId!;
  const managementApi = new ApiGatewayManagementApi({
    endpoint: process.env.IS_OFFLINE
      ? "http://localhost:3001"
      : `${event.requestContext.domainName}/${event.requestContext.stage}`,
  });

  const { message } = JSON.parse(event.body!);
  if (!message) {
    await managementApi
      .deleteConnection({ ConnectionId: connectionId })
      .promise();
    return { statusCode: 200 };
  }

  await managementApi
    .postToConnection({
      ConnectionId: connectionId,
      Data: JSON.stringify({ message }),
    })
    .promise();
  return { statusCode: 200 };
};
