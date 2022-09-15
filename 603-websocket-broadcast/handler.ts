import { ApiGatewayManagementApi, DynamoDB } from "aws-sdk";

import { APIGatewayEvent } from "aws-lambda";

const TableName = process.env.TABLE_NAME!;
const db = !process.env.IS_OFFLINE
  ? new DynamoDB.DocumentClient()
  : new DynamoDB.DocumentClient({
      region: "localhost",
      endpoint: "http://localhost:8000",
    });

export const handleConnect = async (event: APIGatewayEvent) => {
  const connectionId = event.requestContext.connectionId!;
  try {
    await db.put({ TableName, Item: { connectionId } }).promise();
  } catch (error) {
    console.error({ error });
  }
  return { statusCode: 200 };
};

export const handleDisconnect = async (event: APIGatewayEvent) => {
  const connectionId = event.requestContext.connectionId!;
  await db.delete({ TableName, Key: { connectionId } }).promise();
  return { statusCode: 200 };
};

async function scanAllConnectionIds(): Promise<string[]> {
  const scanParams: DynamoDB.DocumentClient.ScanInput = {
    TableName,
    ProjectionExpression: "connectionId",
    ExclusiveStartKey: undefined,
  };
  const connectionIds: string[] = [];
  while (true) {
    const result = await db.scan(scanParams).promise();
    result.Items?.forEach(({ connectionId }) =>
      connectionIds.push(connectionId)
    );
    if (result.LastEvaluatedKey === undefined) {
      break;
    }
    scanParams.ExclusiveStartKey = result.LastEvaluatedKey;
  }
  return connectionIds;
}

export const handleMessage = async (event: APIGatewayEvent) => {
  const body = event.body;
  if (!body) {
    return { statusCode: 200 };
  }
  const managementApi = new ApiGatewayManagementApi({
    endpoint: process.env.IS_OFFLINE
      ? "http://localhost:3001"
      : `${event.requestContext.domainName}/${event.requestContext.stage}`,
  });
  const connectionIds = await scanAllConnectionIds();
  await Promise.all(
    connectionIds.map((connectionId) =>
      managementApi
        .postToConnection({ ConnectionId: connectionId, Data: body })
        .promise()
    )
  );
  return { statusCode: 200 };
};
