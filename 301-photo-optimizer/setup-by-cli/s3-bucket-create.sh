#!/bin/bash

BUCKET_NAME="$1"
if [ -z "${BUCKET_NAME}" ]; then
  echo "$0 bucket-name"
  exit 0
fi
echo "Setup S3 Bucket: ${BUCKET_NAME}"

# 서울(ap-northeast-2) 지역에 S3 Bucket 생성.
aws s3api create-bucket \
  --bucket "${BUCKET_NAME}" \
  --create-bucket-configuration LocationConstraint=ap-northeast-2

# S3 Bucket 안의 모든 객체를 퍼블릭으로 노출하기 위한 정책 설정.
cat << EOF > "s3-bucket-policy.json"
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${BUCKET_NAME}/*"
        }
    ]
}
EOF

# S3 Bucket 정책 갱신.
aws s3api put-bucket-policy \
  --bucket "${BUCKET_NAME}" \
  --policy file://s3-bucket-policy.json 

# S3 Bucket이 정적 웹사이트를 지원하도록 구성.
aws s3 website "s3://${BUCKET_NAME}/" \
  --index-document index.html \
  --error-document error.html

