#!/bin/bash

set -x

aws s3 mb s3://${BUCKET_NAME} --region ap-northeast-2
