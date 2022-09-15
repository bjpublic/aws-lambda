import { DynamoDB } from "aws-sdk";

const ConnectionUserTableName = process.env.CONNECTION_USER_TABLE_NAME!;
const UserConnectionTableName = process.env.USER_CONNECTION_TABLE_NAME!;
const UserTopicTableName = process.env.USER_TOPIC_TABLE_NAME!;
const TopicConnectionTableName = process.env.TOPIC_CONNECTION_TABLE_NAME!;

const db = !process.env.IS_OFFLINE
  ? new DynamoDB.DocumentClient()
  : new DynamoDB.DocumentClient({
      region: "localhost",
      endpoint: "http://localhost:8000",
    });

export async function insertConnectionUserId(
  connectionId: string,
  userId: string
): Promise<void> {
  await db
    .put({
      TableName: ConnectionUserTableName,
      Item: { connectionId, userId },
    })
    .promise();
}

export async function deleteConnectionUserId(
  connectionId: string
): Promise<void> {
  await db
    .delete({
      TableName: ConnectionUserTableName,
      Key: { connectionId },
    })
    .promise();
}

export async function findUserIdByConnectionId(
  connectionId: string
): Promise<string | null> {
  const tuple = await db
    .get({
      TableName: ConnectionUserTableName,
      Key: { connectionId },
    })
    .promise();
  return tuple.Item?.userId ?? null;
}

function StringSetTable(tableName: string, keyName: string, setName: string) {
  async function create(id: string) {
    await db
      .put({
        TableName: tableName,
        Item: { [keyName]: id },
      })
      .promise();
  }

  async function get(id: string): Promise<Record<string, any> | undefined> {
    const tuple = await db
      .get({
        TableName: tableName,
        Key: { [keyName]: id },
      })
      .promise();
    return tuple.Item;
  }

  async function exists(id: string): Promise<boolean> {
    return (await get(id)) !== undefined;
  }

  async function appendValue(id: string, value: string): Promise<void> {
    await db
      .update({
        TableName: tableName,
        Key: { [keyName]: id },
        UpdateExpression: `ADD ${setName} :v`,
        ExpressionAttributeValues: { ":v": db.createSet([value]) },
        ConditionExpression: `attribute_exists(${keyName})`,
      })
      .promise();
  }

  async function removeValue(id: string, value: string): Promise<void> {
    await db
      .update({
        TableName: tableName,
        Key: { [keyName]: id },
        UpdateExpression: `DELETE ${setName} :v`,
        ExpressionAttributeValues: { ":v": db.createSet([value]) },
        ConditionExpression: `attribute_exists(${keyName})`,
      })
      .promise();
  }

  async function getValues(id: string): Promise<string[]> {
    const tuple = await get(id);
    return tuple && tuple[setName] && tuple[setName].values
      ? tuple[setName].values
      : [];
  }

  return { create, exists, appendValue, removeValue, getValues };
}

export const UserConnectionTable = StringSetTable(
  UserConnectionTableName,
  "userId",
  "connectionIds"
);
export const UserTopicTable = StringSetTable(
  UserTopicTableName,
  "userId",
  "topicIds"
);
export const TopicConnectionTable = StringSetTable(
  TopicConnectionTableName,
  "topicId",
  "connectionIds"
);
