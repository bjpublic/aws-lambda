import type { AWS } from "@serverless/typescript";

const layers = [
  "arn:aws:lambda:ap-northeast-2:804048088346:layer:better-sqlite3:4",
];

const subnetIds = [
  "subnet-8c55ece7",
  "subnet-9385efe8",
  "subnet-a70ee3e8",
  "subnet-77926c28",
];
const securityGroupIds = ["sg-29bb2654"];

const vpc = {
  subnetIds,
  securityGroupIds,
};

const functions = {
  createPost: {
    handler: "handler.createPost",
    events: [
      { httpApi: { path: "/api/post", method: "post", authorizer: "auth" } },
    ],
    layers,
    vpc,
  },
  readPost: {
    handler: "handler.readPost",
    events: [{ httpApi: { path: "/api/post/{title}", method: "get" } }],
    layers,
  },
  updatePost: {
    handler: "handler.updatePost",
    events: [
      {
        httpApi: {
          path: "/api/post/{title}",
          method: "put",
          authorizer: "auth",
        },
      },
    ],
    layers,
    vpc,
  },
  deletePost: {
    handler: "handler.deletePost",
    events: [
      {
        httpApi: {
          path: "/api/post/{title}",
          method: "delete",
          authorizer: "auth",
        },
      },
    ],
    layers,
    vpc,
  },
  listPosts: {
    handler: "handler.listPosts",
    events: [{ httpApi: { path: "/api/post", method: "get" } }],
    layers,
  },
  loginGoogle: {
    handler: "authHandler.loginGoogle",
    events: [{ httpApi: { path: "/api/login/google", method: "post" } }],
  },
  logout: {
    handler: "authHandler.logout",
    events: [
      { httpApi: { path: "/api/logout", method: "post", authorizer: "auth" } },
    ],
  },
  grant: {
    handler: "authHandler.grant",
    events: [{ httpApi: { path: "/api/grant", method: "post" } }],
  },
  authorize: {
    handler: "authHandler.authorize",
  },
};

const S3Bucket = {
  Type: "AWS::S3::Bucket",
  Properties: {
    BucketName: process.env.BUCKET_NAME!,
  },
};

const RedisInstance = {
  Type: "AWS::ElastiCache::ReplicationGroup",
  Properties: {
    ReplicationGroupId: process.env.REDIS_NAME!,
    ReplicationGroupDescription: "Redis instance for simple locking",
    CacheNodeType: "cache.t3.micro",
    Engine: "redis",
    ReplicasPerNodeGroup: 0,
    AutomaticFailoverEnabled: false,
    SecurityGroupIds: securityGroupIds,
  },
};

const config: AWS = {
  service: "simple-blog-sqlite-auth",
  frameworkVersion: "3",
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "ap-northeast-2",
    environment: {
      BUCKET_NAME: process.env.BUCKET_NAME!,
      REDIS_HOST: {
        "Fn::GetAtt": ["RedisInstance", "PrimaryEndPoint.Address"],
      },
      JWT_SECRET_KEY: process.env.JWT_SECRET_KEY!,
      ADMIN_EMAIL: process.env.ADMIN_EMAIL!,
    },
    iam: {
      role: {
        statements: [
          {
            Action: ["s3:PutObject", "s3:GetObject"],
            Effect: "Allow",
            Resource: `arn:aws:s3:::${process.env.BUCKET_NAME}/*`,
          },
        ],
      },
    },
    httpApi: {
      authorizers: {
        auth: {
          type: "request",
          functionName: "authorize",
          enableSimpleResponses: true,
          identitySource: ["$request.header.cookie"],
        },
      },
    },
    logs: {
      httpApi: {
        format: `$context.identity.sourceIp - - [$context.requestTime] "$context.routeKey $context.protocol" $context.status $context.responseLength $context.requestId $context.authorizer.error`,
      },
    },
  },
  functions,
  package: {
    individually: true,
  },
  plugins: ["serverless-webpack", "serverless-s3-local", "serverless-offline"],
  resources: {
    Resources: {
      S3Bucket,
      RedisInstance,
    },
  },
};

export = config;
