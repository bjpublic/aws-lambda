#!/bin/bash

set -euxo pipefail

VPC_ID="$(aws ec2 describe-vpcs | jq -r '.Vpcs[] | select(.IsDefault) | .VpcId')"
ROUTE_TABLE_ID="$(aws ec2 describe-route-tables --filter Name=vpc-id,Values=${VPC_ID} | jq -r '.RouteTables[].RouteTableId')"

aws ec2 create-vpc-endpoint \
  --service-name com.amazonaws.ap-northeast-2.s3 \
  --vpc-id "${VPC_ID}" \
  --route-table-id "${ROUTE_TABLE_ID}"
