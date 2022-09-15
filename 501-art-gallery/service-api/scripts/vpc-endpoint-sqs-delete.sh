#!/bin/bash

set -euxo pipefail

VPC_ID="$(aws ec2 describe-vpcs | jq -r '.Vpcs[] | select(.IsDefault) | .VpcId')"
VPC_ENDPOINT_ID="$(aws ec2 describe-vpc-endpoints --filter Name=vpc-id,Values=${VPC_ID} --filter Name=service-name,Values=com.amazonaws.ap-northeast-2.sqs | jq -r .VpcEndpoints[].VpcEndpointId)"

if [ -n "${VPC_ENDPOINT_ID}" ]; then
  aws ec2 delete-vpc-endpoints --vpc-endpoint-id "${VPC_ENDPOINT_ID}"
fi
