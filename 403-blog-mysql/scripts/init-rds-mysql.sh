#!/bin/bash

set -euxo pipefail

# DB 이름은 "blog"이다.
MYSQL_HOST="$(aws rds describe-db-instances | jq -r '.DBInstances[] | select(.DBName = "blog") | .Endpoint.Address')"

set +x

cat schema.sql \
  | mysql -h "${MYSQL_HOST}" -u "${MYSQL_ROOT_USER}" -p"${MYSQL_ROOT_PASSWORD}"
