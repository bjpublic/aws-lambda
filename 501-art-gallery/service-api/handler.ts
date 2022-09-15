import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { SQS } from "aws-sdk";
import { createClient } from "@redis/client";
import { randomUUID } from "crypto";

const redisUrl = `redis://${
  process.env.IS_OFFLINE ? "127.0.0.1" : process.env.REDIS_HOST
}:6379`;
const redisKey = "lambda-playground::art-gallery::likes";
type RedisClientType = ReturnType<typeof createClient>;

const cookieName = "trace-id";
const oneDaySeconds = 24 * 60 * 60;

export const acceptTraceIdCookie: APIGatewayProxyHandlerV2 = async (event) => {
  const traceId =
    parseTokenFromCookie(event.cookies ?? [], cookieName) || randomUUID();
  return {
    statusCode: 200,
    headers: {
      "Set-Cookie": `${cookieName}=${traceId}; Path=/; Max-Age=${oneDaySeconds}; Secure; HttpOnly`,
    },
  };
};

export const markAsLike: APIGatewayProxyHandlerV2 = async (event) => {
  const { id } = event.pathParameters ?? {};
  if (!id) {
    return { statusCode: 404 };
  }
  const result = await useRedis((client) => client.hIncrBy(redisKey, id, 1));

  const traceId = parseTokenFromCookie(event.cookies ?? [], cookieName);
  if (traceId) {
    await enqueueLikeEvent({ id, traceId });
  }
  return { result };
};

function parseTokenFromCookie(cookies: string[], cookieName: string): string {
  const cookiePrefix = `${cookieName}=`;
  return (
    cookies
      .filter((cookie) => cookie.includes(cookiePrefix))
      .flatMap((cookie) => cookie.split(/;\s*/g))
      .filter((part) => part.startsWith(cookiePrefix))[0]
      ?.substring(cookiePrefix.length) ?? ""
  );
}

interface LikeEvent {
  traceId: string; // 추적 ID
  id: string; // 작품 ID
}

async function enqueueLikeEvent(event: LikeEvent): Promise<void> {
  const sqs = new SQS({
    endpoint: process.env.IS_OFFLINE ? "http://127.0.0.1:9324" : undefined,
  });
  const queueUrl = await getQueueUrl(sqs, process.env.LIKE_QUEUE_NAME!);
  const sent = await sqs
    .sendMessage({ QueueUrl: queueUrl, MessageBody: JSON.stringify(event) })
    .promise();
}

async function getQueueUrl(sqs: SQS, queueName: string): Promise<string> {
  try {
    const getResult = await sqs.getQueueUrl({ QueueName: queueName }).promise();
    if (getResult.QueueUrl) {
      return getResult.QueueUrl;
    }
  } catch (error: any) {
    if (!/AWS.SimpleQueueService.NonExistentQueue/.test(error.code)) {
      throw error;
    }
  }
  // Only for local.
  const created = await sqs.createQueue({ QueueName: queueName }).promise();
  return created.QueueUrl!;
}

export const fetchLike: APIGatewayProxyHandlerV2 = async (event) => {
  const { id } = event.pathParameters ?? {};
  if (!id) {
    return { statusCode: 404 };
  }
  const value = await useRedis((client) => client.hGet(redisKey, id));
  return { result: value ? +value : 0 };
};

async function useRedis<R>(callback: (client: RedisClientType) => Promise<R>) {
  const client = createClient({ url: redisUrl });
  await client.connect();
  try {
    return await callback(client);
  } finally {
    await client.quit();
  }
}
