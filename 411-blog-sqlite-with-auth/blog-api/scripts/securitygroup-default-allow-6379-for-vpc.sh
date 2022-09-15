#!/bin/bash

set -euxo pipefail

CIDR_BLOCK="$(aws ec2 describe-vpcs | jq -r '.Vpcs[] | select(.IsDefault) | .CidrBlock')"
GROUP_ID="$(aws ec2 describe-security-groups --group-names "default" | jq -r .SecurityGroups[].GroupId)"

aws ec2 authorize-security-group-ingress \
  --group-id "${GROUP_ID}" \
  --protocol tcp \
  --port 6379 \
  --cidr "${CIDR_BLOCK}"
