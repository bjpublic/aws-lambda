import type { AWS } from "@serverless/typescript";

const config: AWS = {
  service: "websocket-echo",
  frameworkVersion: "3",
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "ap-northeast-2",
  },
  functions: {
    handleConnect: {
      handler: "handler.handleConnect",
      events: [{ websocket: { route: "$connect" } }],
    },
    handleMessage: {
      handler: "handler.handleMessage",
      events: [{ websocket: { route: "$default" } }],
    },
  },
  plugins: ["serverless-webpack", "serverless-offline"],
};

export = config;
