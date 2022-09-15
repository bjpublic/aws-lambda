#!/bin/bash

set -euo pipefail

if [ $# -ne 1 ]; then
  echo "$0 target-count"
  exit 0
fi

TARGET_COUNT="$1"
TARGET_URL="https://thisartworkdoesnotexist.com/"
TARGET_DIR="$(dirname "$0")/../website/public/images"

mkdir -p "${TARGET_DIR}"

count_jpg() {
  echo "$(ls -l "${TARGET_DIR}" | grep jpg | wc -l)"
}

while [ 1 ]; do
  COUNT="$(count_jpg)"
  if (( ${COUNT} >= ${TARGET_COUNT} )); then
    break
  fi

  TEMP_FILE="$(mktemp "tmp.XXXXXXXX.jpg")"
  curl -s "${TARGET_URL}" -o "${TEMP_FILE}"

  RESIZED_FILE="$(mktemp "tmp.XXXXXXXX.jpg")"
  convert "${TEMP_FILE}" -resize 128x128 "${RESIZED_FILE}"
  rm -f "${TEMP_FILE}"

  jpegoptim "${RESIZED_FILE}"
  HASH="$(cat "${RESIZED_FILE}" | md5sum | awk '{print $1}')"
  mv "${RESIZED_FILE}" "${TARGET_DIR}/${HASH}.jpg"
  echo "OK! ${HASH}.jpg"
  sleep 5
done

echo "Done!"

