#!/bin/bash

set -euxo pipefail

VPC_ID="$(aws ec2 describe-vpcs | jq -r '.Vpcs[] | select(.IsDefault) | .VpcId')"
SUBNET_IDS="$(aws ec2 describe-subnets --filter Name=vpc-id,Values=${VPC_ID} | jq -r '.Subnets[].SubnetId' | xargs)"

aws ec2 create-vpc-endpoint \
  --service-name com.amazonaws.ap-northeast-2.sqs --vpc-endpoint-type Interface \
  --vpc-id "${VPC_ID}" \
  --subnet-ids ${SUBNET_IDS}
