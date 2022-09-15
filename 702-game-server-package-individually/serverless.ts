import VpcResources, {
  vpcPrivateSubnetIds,
  vpcSecurityGroupIds,
} from "./resources/VpcResources";

import type { AWS } from "@serverless/typescript";
import { RedisHost } from "./resources/RedisResources";
import RedisResources from "./resources/RedisResources";

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
      MANAGEMENT_API_URL: `${subDomain}.${rootDomain}`,
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
    websocketsApiRouteSelectionExpression: "$request.body.type",
  },
  functions: {
    handleMatch: {
      handler: "handlers/match.handleMatch",
      timeout: 900,
    },
    handleGame: {
      handler: "handlers/game.handleGame",
      timeout: 900,
    },
    handleConnect: {
      handler: "handlers/connect.handleConnect",
      events: [{ websocket: { route: "$connect" } }],
    },
    handleMatchMessage: {
      handler: "handlers/message-match.handleMatchMessage",
      timeout: 29,
      events: [{ websocket: { route: "match" } }],
    },
    handleMessage: {
      handler: "handlers/message-default.handleMessageDefault",
      events: [{ websocket: { route: "$default" } }],
    },
    handleDisconnect: {
      handler: "handlers/disconnect.handleDisconnect",
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
  package: {
    individually: true,
  },
  custom: {
    customDomain: websocketDomain,
  },
};

module.exports = config;
