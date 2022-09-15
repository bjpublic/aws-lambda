const OAI = {
  Type: "AWS::CloudFront::CloudFrontOriginAccessIdentity",
  Properties: {
    CloudFrontOriginAccessIdentityConfig: {
      Comment: "블로그 프론트엔드 페이지용 OAI",
    },
  },
};

const BlogStaticFileBucket = {
  Type: "AWS::S3::Bucket",
  Properties: {
    BucketName: process.env.WEBSITE_BUCKET_NAME!,
  },
};

const BlogStaticFileBucketOAIPolicy = {
  Type: "AWS::S3::BucketPolicy",
  Properties: {
    Bucket: { Ref: "BlogStaticFileBucket" },
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

const APIOrigin = {
  Id: "APIOrigin",
  DomainName: process.env.API_DOMAIN!,
  CustomOriginConfig: {
    OriginProtocolPolicy: "https-only",
    OriginSSLProtocols: ["TLSv1.2"],
  },
};

const DefaultCacheBehavior = {
  TargetOriginId: "S3Origin",
  ViewerProtocolPolicy: "redirect-to-https",
  Compress: true,
  CachePolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
};

const APIOriginRequestPolicy = {
  Type: "AWS::CloudFront::OriginRequestPolicy",
  Properties: {
    OriginRequestPolicyConfig: {
      Name: "AllViewerExceptHostHeader",
      Comment:
        "Host 헤더를 제외하고 나머지 모든 정보를 오리진으로 전달하는 정책",
      CookiesConfig: {
        CookieBehavior: "all",
      },
      HeadersConfig: {
        HeaderBehavior: "whitelist",
        Headers: [
          "Accept-Charset",
          "Origin",
          "Access-Control-Request-Method",
          "Access-Control-Request-Headers",
          "Referer",
          "Accept-Language",
        ],
      },
      QueryStringsConfig: {
        QueryStringBehavior: "all",
      },
    },
  },
};

const APIOriginCacheBehavior = {
  TargetOriginId: "APIOrigin",
  PathPattern: "/api/*",
  ViewerProtocolPolicy: "https-only",
  AllowedMethods: ["GET", "HEAD", "OPTIONS", "PUT", "PATCH", "POST", "DELETE"],
  CachePolicyId: "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",
  OriginRequestPolicyId: { Ref: "APIOriginRequestPolicy" },
};

const Domain = `${process.env.SUB_DOMAIN}.${process.env.ROOT_DOMAIN}`;
const ViewerCertificate = {
  AcmCertificateArn: process.env.ACM_CERTIFICATE_ARN!,
  MinimumProtocolVersion: "TLSv1.2_2021",
  SslSupportMethod: "sni-only",
};

const CustomErrorResponse = {
  ErrorCode: 403,
  ResponseCode: 200,
  ResponsePagePath: "/index.html",
};

const BlogStaticFileCdn = {
  Type: "AWS::CloudFront::Distribution",
  Properties: {
    DistributionConfig: {
      Comment: "간단한 블로그 웹 서비스",
      Enabled: true,
      DefaultRootObject: "index.html",
      CustomErrorResponses: [CustomErrorResponse],
      Origins: [S3Origin, APIOrigin],
      DefaultCacheBehavior,
      CacheBehaviors: [APIOriginCacheBehavior],
      HttpVersion: "http2",
      Aliases: [Domain],
      ViewerCertificate,
    },
  },
};

const BlogStaticFileCdnDns = {
  Type: "AWS::Route53::RecordSet",
  Properties: {
    AliasTarget: {
      DNSName: { "Fn::GetAtt": ["BlogStaticFileCdn", "DomainName"] },
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
    BlogStaticFileBucket,
    BlogStaticFileBucketOAIPolicy,
    APIOriginRequestPolicy,
    BlogStaticFileCdn,
    BlogStaticFileCdnDns,
  },
};

export default resources;
