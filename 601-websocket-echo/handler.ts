import { APIGatewayEvent } from "aws-lambda";
import { ApiGatewayManagementApi } from "aws-sdk";

export const handleConnect = async (event: APIGatewayEvent) => {
  return { statusCode: 200 };
};

export const handleMessage = async (event: APIGatewayEvent) => {
  const connectionId = event.requestContext.connectionId!;
  const body = event.body;
  if (!body) {
    return { statusCode: 200 };
  }

  const managementApi = new ApiGatewayManagementApi({
    endpoint: process.env.IS_OFFLINE
      ? "http://localhost:3001"
      : `${event.requestContext.domainName}/${event.requestContext.stage}`,
  });

  await managementApi
    .postToConnection({
      ConnectionId: connectionId,
      Data: body,
    })
    .promise();
  return { statusCode: 200 };
};
