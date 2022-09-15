const resources = {
  AWSTemplateFormatVersion: "2010-09-09",
  Resources: {
    OAI: {
      Type: "AWS::CloudFront::CloudFrontOriginAccessIdentity",
      Properties: {
        CloudFrontOriginAccessIdentityConfig: {
          Comment: "사진 최적화 서비스용 OAI",
        },
      },
    },
    PhotoBucket: {
      Type: "AWS::S3::Bucket",
      Properties: {
        BucketName: process.env.BUCKET_NAME!,
      },
    },
    PhotoBucketOAIPolicy: {
      Type: "AWS::S3::BucketPolicy",
      Properties: {
        Bucket: { Ref: "PhotoBucket" },
        PolicyDocument: {
          Statement: [
            {
              Action: "s3:GetObject",
              Effect: "Allow",
              Resource: `arn:aws:s3:::${process.env.BUCKET_NAME}/*`,
              Principal: {
                CanonicalUser: { "Fn::GetAtt": ["OAI", "S3CanonicalUserId"] },
              },
            },
          ],
        },
      },
    },
    PhotoCdn: {
      Type: "AWS::CloudFront::Distribution",
      Properties: {
        DistributionConfig: {
          Enabled: true,
          DefaultRootObject: "index.html",
          Origins: [
            {
              Id: "S3Origin",
              DomainName: `${process.env.BUCKET_NAME}.s3.ap-northeast-2.amazonaws.com`,
              S3OriginConfig: {
                OriginAccessIdentity: {
                  "Fn::Join": [
                    "",
                    ["origin-access-identity/cloudfront/", { Ref: "OAI" }],
                  ],
                },
              },
            },
          ],
          DefaultCacheBehavior: {
            ForwardedValues: {
              QueryString: false,
            },
            TargetOriginId: "S3Origin",
            ViewerProtocolPolicy: "redirect-to-https",
          },
          Aliases: [`${process.env.SUB_DOMAIN}.${process.env.ROOT_DOMAIN}`],
          ViewerCertificate: {
            AcmCertificateArn: process.env.ACM_CERTIFICATE_ARN!,
            MinimumProtocolVersion: "TLSv1.2_2021",
            SslSupportMethod: "sni-only",
          },
        },
      },
    },
    PhotoCdnDns: {
      Type: "AWS::Route53::RecordSet",
      Properties: {
        AliasTarget: {
          DNSName: { "Fn::GetAtt": ["PhotoCdn", "DomainName"] },
          HostedZoneId: "Z2FDTNDATAQYW2",
        },
        HostedZoneName: `${process.env.ROOT_DOMAIN}.`,
        Name: `${process.env.SUB_DOMAIN}.${process.env.ROOT_DOMAIN}`,
        Type: "A",
      },
    },
  },
};

export default resources;
