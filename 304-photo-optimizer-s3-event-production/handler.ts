import * as AWS from "aws-sdk";
import * as childProcess from "child_process";
import * as fs from "fs";
import * as path from "path";

import { APIGatewayProxyHandlerV2, S3Handler } from "aws-lambda";

import tar from "tar";

const s3 = new AWS.S3();
const cloudfront = new AWS.CloudFront();

export const getSignedURL: APIGatewayProxyHandlerV2<unknown> = async () => {
  // 동시 요청에도 최대한 겹치지 않을 키를 적당한 수준에서 생성한다.
  const photoKey = `${new Date().getTime()}${Math.random()}`;

  // 사진 업로드를 위한 미리 서명된 URL을 생성한다. 이 때 5분 내에만 유효하도록 설정한다.
  const acceleratedS3 = new AWS.S3({ useAccelerateEndpoint: true });
  const uploadURL = await acceleratedS3.getSignedUrlPromise("putObject", {
    Bucket: process.env.BUCKET_NAME!,
    Key: `raw/${photoKey}.jpg`,
    Expires: 5 * 60,
  });

  // 최적화 단계는 내부 S3 이벤트로 진행되므로, 사용자에게 미리 CDN URL을 전달한다.
  // CDN URL은 photoKey를 그대로 사용하는 형태이다.
  const cdnURL = `https://${process.env.SUB_DOMAIN}.${process.env.ROOT_DOMAIN}/photo/${photoKey}.jpg`;
  return { cdnURL, uploadURL };
};

export const optimizeAndUpload: S3Handler = async (event) => {
  // 여러 객체에 대한 이벤트를 한 번에 처리할 수 있으므로 jpegoptim 준비는 한 번만 한다.
  await unpackJpegoptim();

  const resultKeys: string[] = [];

  // S3 객체 생성 이벤트로부터 받은 모든 키에 대해 최적화를 처리한다.
  for (const record of event.Records) {
    // 이벤트가 발생한 key는 "getSignedURL"에서 지정한 "Key" 값으로
    // Bucket에 업로드된 객체의 키다. "raw/photoKey.jpg" 형태이다.
    const rawKey = record.s3.object.key;
    const resultKey = await downloadAndOptimizeAndUpload(rawKey);

    // 최적화된 사진의 객체 키를 모아서 한 번에 CloudFront 캐시를 제거한다.
    resultKeys.push(resultKey);
  }

  // 사용자는 CDN URL을 "getSignedURL" 함수 호출 시 받으므로 이미 해당 URL에
  // 접근하여 404를 캐시했을 수 있다. 이를 제거하여 최적화된 사진 결과물을 받을 수 있도록 한다.
  await cloudfront
    .createInvalidation({
      DistributionId: process.env.DISTRIBUTION_ID!,
      InvalidationBatch: {
        Paths: {
          Items: resultKeys.map((resultKey) => `/${resultKey}`),
          Quantity: resultKeys.length,
        },
        // 중복 실행 방지를 위한 값이지만 현 시점에서는 의미가 없으므로 NOW를 넣는다.
        CallerReference: Date.now().toString(),
      },
    })
    .promise();
};

async function downloadAndOptimizeAndUpload(rawKey: string): Promise<string> {
  // "raw/photoKey.jpg"에서 "photoKey.jpg"를 가져온다.
  const photoKeyWithJpg = path.basename(rawKey);
  const filePath = `/tmp/${photoKeyWithJpg}`;

  // 업로드된 원본 사진을 임시 파일로 다운로드한다.
  await downloadBucketObject(process.env.BUCKET_NAME!, rawKey, filePath);

  // 결과를 담는 resultKey는 "photo/" 접두사를 가진다.
  const resultKey = `photo/${photoKeyWithJpg}`;
  try {
    // jpegoptim를 실행하여 최적화를 수행한다.
    childProcess.execSync(`${jpegoptimPath} -o -s -m80 ${filePath}`);

    // 최적화가 완료된 파일을 S3 Bucket에 업로드한다.
    await s3
      .upload({
        Bucket: process.env.BUCKET_NAME!,
        Key: resultKey,
        Body: fs.createReadStream(filePath),
        ContentType: "image/jpeg",
      })
      .promise();
    return resultKey;
  } finally {
    // 작업 임시 파일을 삭제하여 Lambda 인스턴스 재사용 시에 /tmp의 용량 부족이
    // 발생하지 않도록 한다.
    fs.unlinkSync(filePath);

    // 원본 사진 파일을 삭제하여 불필요한 S3 Bucket 용량 점유를 막는다.
    await s3
      .deleteObject({ Bucket: process.env.BUCKET_NAME!, Key: rawKey })
      .promise();
  }
}

// Bucket 객체를 지정된 로컬 위치에 다운로드한다.
async function downloadBucketObject(
  bucketName: string,
  key: string,
  localPath: string
): Promise<void> {
  return new Promise<void>((resolve, reject) =>
    s3
      .getObject({ Bucket: bucketName, Key: key })
      .createReadStream()
      .on("error", reject)
      .pipe(
        fs.createWriteStream(localPath).on("error", reject).on("close", resolve)
      )
  );
}

const jpegoptimPath = "/tmp/bin/jpegoptim";
const jpegoptimPackFile = "jpegoptim.tar.gz";

async function unpackJpegoptim(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    // Lambda 인스턴스가 재사용되어 이미 jpegoptim이 준비된 경우
    // 그 실행 파일을 다시 사용할 수 있도록 한다.
    if (fs.existsSync(jpegoptimPath)) {
      return resolve();
    }
    // 만약 Lambda 인스턴스가 처음 사용되는 경우라 jpegoptim이 없다면
    // 지금 압축을 풀어 해당 실행 파일을 준비하도록 한다.
    fs.createReadStream(jpegoptimPackFile)
      .pipe(
        tar.x({ strip: 1, C: "/tmp" }).on("error", reject).on("close", resolve)
      )
      .on("error", reject);
  });
}
