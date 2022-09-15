import type { AWS } from "@serverless/typescript";

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

const stage = "dev";
const subDomain = process.env.SUB_DOMAIN!;
const rootDomain = process.env.ROOT_DOMAIN!;

const websocketDomain = {
  apiType: "websocket",
  stage,
  basePath: stage,
  domainName: `${subDomain}.${rootDomain}`,
  certificateName: rootDomain,
  endpointType: "regional",
  createRoute53Record: "true",
};

const dynamodbLocal = {
  stages: [stage],
  start: {
    migrate: true,
  },
};

const config: AWS = {
  service: "websocket-topic",
  frameworkVersion: "3",
  provider: {
    name: "aws",
    stage,
    runtime: "nodejs14.x",
    region: "ap-northeast-2",
    logs: {
      websocket: {
        level: "INFO",
      },
    },
    iam: {
      role: {
        statements: [
          DynamoDBTableRoleStatement({ UserConnectionTable }),
          DynamoDBTableRoleStatement({ UserTopicTable }),
          DynamoDBTableRoleStatement({ TopicConnectionTable }),
        ],
      },
    },
    environment: {
      USER_CONNECTION_TABLE_NAME: UserConnectionTableName,
      USER_TOPIC_TABLE_NAME: UserTopicTableName,
      TOPIC_CONNECTION_TABLE_NAME: TopicConnectionTableName,
    },
  },
  functions: {
    authorize: {
      handler: "handler.authorize",
    },
    handleConnect: {
      handler: "handler.handleConnect",
      events: [
        {
          websocket: {
            route: "$connect",
            authorizer: {
              name: "authorize",
              identitySource: "route.request.querystring.token",
            },
          },
        },
      ],
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
    "serverless-domain-manager",
  ],
  resources: {
    Resources: {
      UserTopicTable,
      TopicConnectionTable,
    },
  },
  custom: {
    dynamodb: dynamodbLocal,
    customDomain: websocketDomain,
  },
};

export = config;
