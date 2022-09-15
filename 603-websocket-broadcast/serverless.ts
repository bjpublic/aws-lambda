import type { AWS } from "@serverless/typescript";

const TableName = process.env.TABLE_NAME;

const ConnectionTable = {
  Type: "AWS::DynamoDB::Table",
  Properties: {
    TableName,
    KeySchema: [{ AttributeName: "connectionId", KeyType: "HASH" }],
    AttributeDefinitions: [
      { AttributeName: "connectionId", AttributeType: "S" },
    ],
    BillingMode: "PAY_PER_REQUEST",
  },
};
const ConnectionTableRoleStatement = {
  Effect: "Allow",
  Action: ["dynamodb:PutItem", "dynamodb:Scan", "dynamodb:DeleteItem"],
  Resource: { "Fn::GetAtt": ["ConnectionTable", "Arn"] },
};

const dynamodbLocal = {
  stages: ["dev"],
  start: { migrate: true },
};

const config: AWS = {
  service: "websocket-broadcast",
  frameworkVersion: "3",
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "ap-northeast-2",
    iam: { role: { statements: [ConnectionTableRoleStatement] } },
    environment: {
      TABLE_NAME: process.env.TABLE_NAME!,
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
  },
  plugins: [
    "serverless-webpack",
    "serverless-dynamodb-local",
    "serverless-offline",
  ],
  resources: {
    Resources: {
      ConnectionTable,
    },
  },
  custom: {
    dynamodb: dynamodbLocal,
  },
};

export = config;
