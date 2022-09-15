import type { AWS } from "@serverless/typescript";

const config: AWS = {
  service: "hello-api-ts",
  frameworkVersion: "3",
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "ap-northeast-2",
    logs: {
      httpApi: {
        format:
          '{"requestId":"$context.requestId","ip":"$context.identity.sourceIp","requestTime":"$context.requestTime","httpMethod":"$context.httpMethod","routeKey":"$context.routeKey","status":"$context.status","protocol":"$context.protocol","responseLength":"$context.responseLength"}',
      },
    },
    httpApi: {
      metrics: true,
    },
  },
  functions: {
    hello: {
      handler: "handler.hello",
      events: [
        {
          httpApi: {
            path: "/hello",
            method: "get",
          },
        },
      ],
    },
  },
  plugins: ["serverless-webpack"],
};

export = config;
