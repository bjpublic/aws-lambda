import type { AWS } from "@serverless/typescript";

const functions = {
  createPost: {
    handler: "handler.createPost",
    events: [{ httpApi: { path: "/api/post", method: "post" } }],
  },
  readPost: {
    handler: "handler.readPost",
    events: [{ httpApi: { path: "/api/post/{title}", method: "get" } }],
  },
  updatePost: {
    handler: "handler.updatePost",
    events: [{ httpApi: { path: "/api/post/{title}", method: "put" } }],
  },
  deletePost: {
    handler: "handler.deletePost",
    events: [{ httpApi: { path: "/api/post/{title}", method: "delete" } }],
  },
  listPosts: {
    handler: "handler.listPosts",
    events: [{ httpApi: { path: "/api/post", method: "get" } }],
  },
};

const MySQLDBInstance = {
  Type: "AWS::RDS::DBInstance",
  Properties: {
    AllocatedStorage: "5",
    DBInstanceClass: "db.t3.micro",
    Engine: "MySQL",
    DBName: "blog",
    MasterUsername: process.env.MYSQL_ROOT_USER,
    MasterUserPassword: process.env.MYSQL_ROOT_PASSWORD,
    PubliclyAccessible: true,
  },
  DeletionPolicy: "Snapshot",
};

const config: AWS = {
  service: "simple-blog-mysql",
  frameworkVersion: "3",
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "ap-northeast-2",
    environment: {
      MYSQL_HOST: { "Fn::GetAtt": ["MySQLDBInstance", "Endpoint.Address"] },
      MYSQL_ROOT_USER: process.env.MYSQL_ROOT_USER!,
      MYSQL_ROOT_PASSWORD: process.env.MYSQL_ROOT_PASSWORD!,
    },
  },
  functions,
  plugins: ["serverless-webpack", "serverless-offline"],
  resources: {
    Resources: {
      MySQLDBInstance,
    },
  },
};

export = config;
