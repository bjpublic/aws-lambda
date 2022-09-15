#!/bin/bash

docker run \
  --name sqs-local \
  --rm \
  -it \
  -p 9324:9324 \
  -p 9325:9325 \
  softwaremill/elasticmq:latest
