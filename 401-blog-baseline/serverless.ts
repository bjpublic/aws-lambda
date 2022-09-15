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

const config: AWS = {
  service: "simple-blog",
  frameworkVersion: "3",
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "ap-northeast-2",
  },
  functions,
  plugins: ["serverless-webpack"],
  resources: {
    Resources: {},
  },
};

export = config;
