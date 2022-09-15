import * as db from "./db";

import {
  APIGatewayEvent,
  APIGatewayProxyHandlerV2,
  APIGatewayRequestAuthorizerHandler,
} from "aws-lambda";

import { ApiGatewayManagementApi } from "aws-sdk";

export const authorize: APIGatewayRequestAuthorizerHandler = async (event) => {
  const token = (event.queryStringParameters ?? {})["token"];
  if (!token) {
    throw "Unauthorized";
  }
  if (!(await db.UserTopicTable.exists(token))) {
    throw "Unauthorized";
  }
  return {
    principalId: token,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: "Allow",
          Resource: event.methodArn,
        },
      ],
    },
    context: {},
  };
};

export const handleConnect = async (event: APIGatewayEvent) => {
  if (!event.requestContext.authorizer) {
    return { statusCode: 400 };
  }
  const { principalId: userId } = event.requestContext.authorizer;
  if (!userId) {
    return { statusCode: 400 };
  }

  const connectionId = event.requestContext.connectionId!;
  try {
    await db.UserConnectionTable.appendValue(userId, connectionId);
    for (const topicId of await db.UserTopicTable.getValues(userId)) {
      await db.TopicConnectionTable.appendValue(topicId, connectionId);
    }
    return { statusCode: 200 };
  } catch (error) {
    console.error({ error });
    return { statusCode: 400 };
  }
};

export const handleDisconnect = async (event: APIGatewayEvent) => {
  if (!event.requestContext.authorizer) {
    return { statusCode: 500 };
  }
  const { principalId: userId } = event.requestContext.authorizer;
  if (!userId) {
    return { statusCode: 500 };
  }

  const connectionId = event.requestContext.connectionId!;
  for (const topicId of await db.UserTopicTable.getValues(userId)) {
    await db.TopicConnectionTable.removeValue(topicId, connectionId);
  }
  await db.UserConnectionTable.removeValue(userId, connectionId);
  return { statusCode: 200 };
};

interface TalkMessage {
  type: "talk";
  topic: string;
  text: string;
}

interface SubscribeMessage {
  type: "subscribe";
  topic: string;
}

interface UnsubscribeMessage {
  type: "unsubscribe";
  topic: string;
}

type Message = TalkMessage | SubscribeMessage | UnsubscribeMessage;

interface TalkResponse {
  type: "talk";
  topic: string;
  sender: string;
  text: string;
}

type SendMessage = (connectionId: string, data: string) => Promise<unknown>;

export const handleMessage = async (event: APIGatewayEvent) => {
  const body = event.body;
  if (!body) {
    return { statusCode: 200 };
  }
  if (!event.requestContext.authorizer) {
    return { statusCode: 400 };
  }
  const { principalId: userId } = event.requestContext.authorizer;
  if (!userId) {
    return { statusCode: 400 };
  }

  const managementApi = new ApiGatewayManagementApi({
    endpoint: process.env.IS_OFFLINE
      ? "http://localhost:3001"
      : `${event.requestContext.domainName}/${event.requestContext.stage}`,
  });
  const sendMessage: SendMessage = async (ConnectionId, Data) => {
    try {
      await managementApi.postToConnection({ ConnectionId, Data }).promise();
    } catch (error) {
      console.error({ error, connectionId }, `메시지를 전달할 수 없습니다`);
    }
  };

  const connectionId = event.requestContext.connectionId!;
  try {
    const message = JSON.parse(body) as Message;
    await processMessage(userId, connectionId, message, sendMessage);
    return { statusCode: 200 };
  } catch (error) {
    console.error(
      { error, connectionId, body },
      "예외가 발생해 연결을 종료합니다"
    );
    await managementApi
      .deleteConnection({ ConnectionId: connectionId })
      .promise();
    return { statusCode: 400 };
  }
};

async function processMessage(
  userId: string,
  connectionId: string,
  message: Message,
  sendMessage: SendMessage
) {
  switch (message.type) {
    case "subscribe":
      await subscribeTopic(userId, message);
      return;
    case "unsubscribe":
      await unsubscribeTopic(userId, message);
      return;
    case "talk":
      await talk(userId, connectionId, message, sendMessage);
      return;
    default:
      throw new Error(`잘못된 메시지 유형입니다`);
  }
}

async function subscribeTopic(userId: string, message: SubscribeMessage) {
  await db.UserTopicTable.appendValue(userId, message.topic);
  for (const connectionId of await db.UserConnectionTable.getValues(userId)) {
    await db.TopicConnectionTable.appendValue(message.topic, connectionId);
  }
}

async function unsubscribeTopic(userId: string, message: UnsubscribeMessage) {
  for (const connectionId of await db.UserConnectionTable.getValues(userId)) {
    await db.TopicConnectionTable.removeValue(message.topic, connectionId);
  }
  await db.UserTopicTable.removeValue(userId, message.topic);
}

async function talk(
  userId: string,
  connectionId: string,
  message: TalkMessage,
  sendMessage: SendMessage
) {
  if (!message.text) {
    throw new Error(`잘못된 메시지입니다: [사용자 ID=${userId}]`);
  }
  const receiverIds = await db.TopicConnectionTable.getValues(message.topic);
  if (!receiverIds.includes(connectionId)) {
    throw new Error(
      `잘못된 주제 접근입니다: [주제 ID=${message.topic}][연결 ID=${connectionId}]`
    );
  }
  const response: TalkResponse = {
    type: "talk",
    topic: message.topic,
    text: message.text,
    sender: userId,
  };
  const data = JSON.stringify(response);
  await Promise.all(
    receiverIds.map((receiverId) => sendMessage(receiverId, data))
  );
}

export const createUser: APIGatewayProxyHandlerV2 = async (event) => {
  const { userId } = event.pathParameters ?? {};
  if (!userId) {
    return { statusCode: 400, body: "Bad Request" };
  }
  await db.UserConnectionTable.create(userId);
  await db.UserTopicTable.create(userId);
  return { statusCode: 200, body: "OK" };
};

export const createTopic: APIGatewayProxyHandlerV2 = async (event) => {
  const { topicId } = event.pathParameters ?? {};
  if (!topicId) {
    return { statusCode: 400, body: "Bad Request" };
  }
  await db.TopicConnectionTable.create(topicId);
  return { statusCode: 200, body: "OK" };
};
