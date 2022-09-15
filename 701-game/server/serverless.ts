import RedisResources, { RedisHost } from "./resources/RedisResources";
import VpcResources, {
  vpcPrivateSubnetIds,
  vpcSecurityGroupIds,
} from "./resources/VpcResources";

import type { AWS } from "@serverless/typescript";

const serviceName = "game-server";
const stage = "dev";

function buildLambdaFunctionName(handlerName: string): string {
  return `${serviceName}-${stage}-${handlerName}`;
}

function lambdaFunctionArn(handlerName: string): Record<string, unknown> {
  return {
    "Fn::Join": [
      ":",
      [
        "arn:aws:lambda",
        { Ref: "AWS::Region" },
        { Ref: "AWS::AccountId" },
        "function",
        buildLambdaFunctionName(handlerName),
        "*",
      ],
    ],
  };
}

const subDomain = process.env.SUB_DOMAIN!;
const rootDomain = process.env.ROOT_DOMAIN!;

const websocketDomain = {
  apiType: "websocket",
  stage,
  domainName: `${subDomain}.${rootDomain}`,
  certificateName: rootDomain,
  endpointType: "regional",
  createRoute53Record: "true",
};

const config: AWS = {
  service: serviceName,
  frameworkVersion: "3",
  provider: {
    name: "aws",
    stage,
    runtime: "nodejs14.x",
    region: "ap-northeast-2",
    memorySize: 128,
    logs: {
      websocket: {
        level: "INFO",
      },
    },
    vpc: {
      subnetIds: vpcPrivateSubnetIds,
      securityGroupIds: vpcSecurityGroupIds,
    },
    environment: {
      REDIS_HOST: RedisHost,
      MATCH_FUNCTION_NAME: buildLambdaFunctionName("handleMatch"),
      GAME_FUNCTION_NAME: buildLambdaFunctionName("handleGame"),
      MANAGEMENT_API_URL: websocketDomain.domainName,
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: "lambda:InvokeFunction",
            Resource: [
              lambdaFunctionArn("handleMatch"),
              lambdaFunctionArn("handleGame"),
            ],
          },
        ],
      },
    },
  },
  functions: {
    handleMatch: {
      handler: "handler.handleMatch",
      timeout: 900,
    },
    handleGame: {
      handler: "handler.handleGame",
      timeout: 900,
    },
    handleConnect: {
      handler: "handler.handleConnect",
      events: [{ websocket: { route: "$connect" } }],
    },
    handleMessage: {
      handler: "handler.handleMessage",
      timeout: 29,
      events: [{ websocket: { route: "$default" } }],
    },
    handleDisconnect: {
      handler: "handler.handleDisconnect",
      events: [{ websocket: { route: "$disconnect" } }],
    },
  },
  plugins: [
    "serverless-webpack",
    "serverless-offline",
    "serverless-domain-manager",
  ],
  resources: {
    AWSTemplateFormatVersion: "2010-09-09",
    Resources: {
      ...VpcResources,
      ...RedisResources,
    },
  },
  custom: {
    customDomain: websocketDomain,
  },
};

export = config;
