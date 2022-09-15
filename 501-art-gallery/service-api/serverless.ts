import type { AWS } from "@serverless/typescript";

// 좋아요 이벤트를 보관하기 위한 SQS 대기열 선언
const queueName = process.env.LIKE_QUEUE_NAME!;
const LikeQueue = {
  Type: "AWS::SQS::Queue",
  Properties: {
    QueueName: queueName,
  },
};
// Lambda에서 SQS 대기열에 접근하기 위한 정책 선언
const LikeQueueStatement = {
  Action: ["sqs:GetQueueUrl", "sqs:SendMessage"],
  Effect: "Allow",
  Resource: {
    "Fn::Join": [
      ":",
      [
        "arn:aws:sqs",
        { Ref: "AWS::Region" },
        { Ref: "AWS::AccountId" },
        queueName,
      ],
    ],
  },
};

// Redis 접근을 위한 VPC 구성
const subnetIds = [
  "subnet-8c55ece7",
  "subnet-9385efe8",
  "subnet-a70ee3e8",
  "subnet-77926c28",
];
const securityGroupIds = ["sg-29bb2654"];
const vpc = { subnetIds, securityGroupIds };

// Lambda 함수 선언. Redis를 사용하는 함수만 VPC 사용.
const functions = {
  acceptTraceIdCookie: {
    handler: "handler.acceptTraceIdCookie",
    events: [{ httpApi: { path: "/api/accept-trace", method: "post" } }],
  },
  markAsLike: {
    handler: "handler.markAsLike",
    events: [{ httpApi: { path: "/api/{id}/like", method: "post" } }],
    vpc,
  },
  fetchLike: {
    handler: "handler.fetchLike",
    events: [{ httpApi: { path: "/api/{id}/like", method: "get" } }],
    vpc,
  },
};

// 좋아요 횟수를 관리하기 위한 Redis 인스턴스 선언.
const RedisInstance = {
  Type: "AWS::ElastiCache::ReplicationGroup",
  Properties: {
    ReplicationGroupId: process.env.REDIS_NAME!,
    ReplicationGroupDescription: "Redis instance for like counting",
    CacheNodeType: "cache.t3.micro",
    Engine: "redis",
    ReplicasPerNodeGroup: 0,
    AutomaticFailoverEnabled: false,
    SecurityGroupIds: securityGroupIds,
  },
};

const config: AWS = {
  service: "art-gallery-api",
  frameworkVersion: "3",
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "ap-northeast-2",
    environment: {
      LIKE_QUEUE_NAME: process.env.LIKE_QUEUE_NAME!,
      REDIS_HOST: {
        "Fn::GetAtt": ["RedisInstance", "PrimaryEndPoint.Address"],
      },
    },
    iam: { role: { statements: [LikeQueueStatement] } },
  },
  functions,
  resources: {
    Resources: {
      LikeQueue,
      RedisInstance,
    },
  },
  plugins: ["serverless-webpack", "serverless-offline"],
};

export = config;
