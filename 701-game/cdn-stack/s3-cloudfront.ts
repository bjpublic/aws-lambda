const OAI = {
  Type: "AWS::CloudFront::CloudFrontOriginAccessIdentity",
  Properties: {
    CloudFrontOriginAccessIdentityConfig: {
      Comment: "뱀 게임 프론트엔드 페이지용 OAI",
    },
  },
};

const SnakeStaticFileBucket = {
  Type: "AWS::S3::Bucket",
  Properties: {
    BucketName: process.env.WEBSITE_BUCKET_NAME!,
  },
};

const SnakeStaticFileBucketOAIPolicy = {
  Type: "AWS::S3::BucketPolicy",
  Properties: {
    Bucket: { Ref: "SnakeStaticFileBucket" },
    PolicyDocument: {
      Statement: [
        {
          Action: "s3:GetObject",
          Effect: "Allow",
          Resource: `arn:aws:s3:::${process.env.WEBSITE_BUCKET_NAME}/*`,
          Principal: {
            CanonicalUser: { "Fn::GetAtt": ["OAI", "S3CanonicalUserId"] },
          },
        },
      ],
    },
  },
};

const S3Origin = {
  Id: "S3Origin",
  DomainName: `${process.env.WEBSITE_BUCKET_NAME}.s3.ap-northeast-2.amazonaws.com`,
  S3OriginConfig: {
    OriginAccessIdentity: {
      "Fn::Join": ["", ["origin-access-identity/cloudfront/", { Ref: "OAI" }]],
    },
  },
};

const DefaultCacheBehavior = {
  TargetOriginId: "S3Origin",
  ViewerProtocolPolicy: "redirect-to-https",
  Compress: true,
  CachePolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
};

const Domain = `${process.env.SUB_DOMAIN}.${process.env.ROOT_DOMAIN}`;
const ViewerCertificate = {
  AcmCertificateArn: process.env.ACM_CERTIFICATE_ARN!,
  MinimumProtocolVersion: "TLSv1.2_2021",
  SslSupportMethod: "sni-only",
};

const SnakeStaticFileCdn = {
  Type: "AWS::CloudFront::Distribution",
  Properties: {
    DistributionConfig: {
      Comment: "온라인 뱀 게임",
      Enabled: true,
      DefaultRootObject: "index.html",
      Origins: [S3Origin],
      DefaultCacheBehavior,
      HttpVersion: "http2",
      Aliases: [Domain],
      ViewerCertificate,
    },
  },
};

const SnakeStaticFileCdnDns = {
  Type: "AWS::Route53::RecordSet",
  Properties: {
    AliasTarget: {
      DNSName: { "Fn::GetAtt": ["SnakeStaticFileCdn", "DomainName"] },
      HostedZoneId: "Z2FDTNDATAQYW2",
    },
    HostedZoneName: `${process.env.ROOT_DOMAIN}.`,
    Name: Domain,
    Type: "A",
  },
};

const resources = {
  AWSTemplateFormatVersion: "2010-09-09",
  Resources: {
    OAI,
    SnakeStaticFileBucket,
    SnakeStaticFileBucketOAIPolicy,
    SnakeStaticFileCdn,
    SnakeStaticFileCdnDns,
  },
};

export default resources;
