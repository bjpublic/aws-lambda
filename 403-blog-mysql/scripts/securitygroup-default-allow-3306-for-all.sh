#!/bin/bash

set -euxo pipefail

GROUP_ID="$(aws ec2 describe-security-groups --group-names "default" | jq -r .SecurityGroups[].GroupId)"

aws ec2 authorize-security-group-ingress \
  --group-id "${GROUP_ID}" \
  --protocol tcp \
  --port 3306 \
  --cidr 0.0.0.0/0
