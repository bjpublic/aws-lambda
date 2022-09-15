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
    events: [{ httpApi: { path: "/api/post", method: "post" } }],
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
    events: [{ httpApi: { path: "/api/post/{title}", method: "put" } }],
    layers,
    vpc,
  },
  deletePost: {
    handler: "handler.deletePost",
    events: [{ httpApi: { path: "/api/post/{title}", method: "delete" } }],
    layers,
    vpc,
  },
  listPosts: {
    handler: "handler.listPosts",
    events: [{ httpApi: { path: "/api/post", method: "get" } }],
    layers,
  },
  serveStatic: {
    handler: "staticHandler.serveStatic",
    events: [
      { httpApi: { path: "/", method: "get" } },
      { httpApi: { path: "/{fileName}", method: "get" } },
      { httpApi: { path: "/static/{type}/{fileName}", method: "get" } },
    ],
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
  service: "simple-blog-sqlite-serve-static",
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
  },
  functions,
  custom: {
    scripts: {
      hooks: {
        "webpack:package:packExternalModules":
          "[ -d .webpack/serveStatic ] && cp -r ../blog-pages/build .webpack/serveStatic/pages || true",
      },
    },
    customDomain: {
      apiType: "http",
      domainName: `${process.env.SUB_DOMAIN}.${process.env.ROOT_DOMAIN}`,
      certificateName: process.env.ROOT_DOMAIN!,
      endpointType: "regional",
      createRoute53Record: true,
    },
  },
  package: {
    individually: true,
  },
  plugins: [
    "serverless-webpack",
    "serverless-s3-local",
    "serverless-offline",
    "serverless-plugin-scripts",
    "serverless-domain-manager",
  ],
  resources: {
    Resources: {
      S3Bucket,
      RedisInstance,
    },
  },
};

export = config;
