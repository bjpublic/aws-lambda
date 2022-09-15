#!/bin/bash

docker run \
  --rm \
  --name mysql \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD}" \
  -v $PWD/mysql-data:/var/lib/mysql \
  mysql:8
