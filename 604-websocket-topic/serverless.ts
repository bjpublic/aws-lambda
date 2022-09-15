import type { AWS } from "@serverless/typescript";

const ConnectionUserTableName = process.env.CONNECTION_USER_TABLE_NAME!;
const UserConnectionTableName = process.env.USER_CONNECTION_TABLE_NAME!;
const UserTopicTableName = process.env.USER_TOPIC_TABLE_NAME!;
const TopicConnectionTableName = process.env.TOPIC_CONNECTION_TABLE_NAME!;

function DynamoDBTable(tableName: string, keyName: string) {
  return {
    Type: "AWS::DynamoDB::Table",
    Properties: {
      TableName: tableName,
      KeySchema: [{ AttributeName: keyName, KeyType: "HASH" }],
      AttributeDefinitions: [{ AttributeName: keyName, AttributeType: "S" }],
      BillingMode: "PAY_PER_REQUEST",
    },
  };
}
const ConnectionUserTable = DynamoDBTable(
  ConnectionUserTableName,
  "connectionId"
);
const UserConnectionTable = DynamoDBTable(UserConnectionTableName, "userId");
const UserTopicTable = DynamoDBTable(UserTopicTableName, "userId");
const TopicConnectionTable = DynamoDBTable(TopicConnectionTableName, "topicId");

function DynamoDBTableRoleStatement(table: { [key: string]: unknown }) {
  return {
    Effect: "Allow",
    Action: [
      "dynamodb:PutItem",
      "dynamodb:GetItem",
      "dynamodb:UpdateItem",
      "dynamodb:DeleteItem",
    ],
    Resource: { "Fn::GetAtt": [Object.keys(table)[0], "Arn"] },
  };
}

const dynamodbLocal = {
  stages: ["dev"],
  start: {
    migrate: true,
  },
};

const config: AWS = {
  service: "websocket-topic",
  frameworkVersion: "3",
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "ap-northeast-2",
    iam: {
      role: {
        statements: [
          DynamoDBTableRoleStatement({ ConnectionUserTable }),
          DynamoDBTableRoleStatement({ UserConnectionTable }),
          DynamoDBTableRoleStatement({ UserTopicTable }),
          DynamoDBTableRoleStatement({ TopicConnectionTable }),
        ],
      },
    },
    environment: {
      CONNECTION_USER_TABLE_NAME: ConnectionUserTableName,
      USER_CONNECTION_TABLE_NAME: UserConnectionTableName,
      USER_TOPIC_TABLE_NAME: UserTopicTableName,
      TOPIC_CONNECTION_TABLE_NAME: TopicConnectionTableName,
    },
  },
  functions: {
    handleConnect: {
      handler: "handler.handleConnect",
      events: [{ websocket: { route: "$connect" } }],
    },
    handleDisconnect: {
      handler: "handler.handleDisconnect",
      events: [{ websocket: { route: "$disconnect" } }],
    },
    handleMessage: {
      handler: "handler.handleMessage",
      events: [{ websocket: { route: "$default" } }],
    },
    createUser: {
      handler: "handler.createUser",
      events: [{ httpApi: { path: "/user/{userId}", method: "POST" } }],
    },
    createTopic: {
      handler: "handler.createTopic",
      events: [{ httpApi: { path: "/topic/{topicId}", method: "POST" } }],
    },
  },
  plugins: [
    "serverless-webpack",
    "serverless-dynamodb-local",
    "serverless-offline",
  ],
  resources: {
    Resources: {
      ConnectionUserTable,
      UserConnectionTable,
      UserTopicTable,
      TopicConnectionTable,
    },
  },
  custom: {
    dynamodb: dynamodbLocal,
  },
};

export = config;
