#!/bin/bash

cat schema.sql \
  | mysql -h 127.0.0.1 -u root -p"${MYSQL_ROOT_PASSWORD}"
