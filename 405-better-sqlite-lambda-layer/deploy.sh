#!/bin/bash

set -euxo pipefail

if [ ! -f "package.json" ]; then
  npm init -y
  npm i --save better-sqlite3
else
  npm i
fi

rm -rf nodejs && mkdir -p nodejs
mv node_modules nodejs
zip -r layer.zip nodejs

aws lambda publish-layer-version --layer-name better-sqlite3 --zip-file fileb://./layer.zip --compatible-runtimes nodejs14.x
