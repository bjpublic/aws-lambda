import type { AWS } from "@serverless/typescript";

const config: AWS = {
  service: "websocket-route",
  frameworkVersion: "3",
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "ap-northeast-2",
    websocketsApiRouteSelectionExpression: "$request.body.action",
  },
  functions: {
    handleConnect: {
      handler: "handler.handleConnect",
      events: [{ websocket: { route: "$connect" } }],
    },
    handleTalkAction: {
      handler: "handler.handleTalkAction",
      events: [{ websocket: { route: "talk" } }],
    },
    handleMessage: {
      handler: "handler.handleMessage",
      events: [{ websocket: { route: "$default" } }],
    },
  },
  plugins: ["serverless-webpack", "serverless-offline"],
};

export = config;
