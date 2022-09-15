import * as AWS from "aws-sdk";
import * as childProcess from "child_process";
import * as crypto from "crypto";
import * as fs from "fs";

import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import getStream from "get-stream";
import tar from "tar";

const s3 = new AWS.S3();

export const getSignedURL: APIGatewayProxyHandlerV2<unknown> = async () => {
  // 동시 요청에도 최대한 겹치지 않을 키를 적당한 수준에서 생성한다.
  const photoKey = `${new Date().getTime()}${Math.random()}`;

  // 사진 업로드를 위한 미리 서명된 URL을 생성한다. 이 때 5분 내에만 유효하도록 설정한다.
  const uploadURL = await s3.getSignedUrlPromise("putObject", {
    Bucket: process.env.BUCKET_NAME!,
    Key: `raw/${photoKey}.jpg`,
    Expires: 5 * 60,
  });
  return { photoKey, uploadURL };
};

export const optimizeAndUpload: APIGatewayProxyHandlerV2 = async (event) => {
  // 사진 키가 올바르지 않거나 Bucket 내에 존재하지 않으면 무시한다.
  const { photoKey } = event.queryStringParameters ?? {};
  if (!photoKey) {
    return { statusCode: 400 };
  }
  // "getSignedURL"에서 지정한 "Key"와 동일한, 업로드한 원본 사진 객체의 키다.
  const rawKey = `raw/${photoKey}.jpg`;
  if (!(await s3Exists(process.env.BUCKET_NAME!, rawKey))) {
    return { statusCode: 404 };
  }
  // 업로드 Bucket에서 최적화를 요청한 원본을 버퍼로 다운로드한다.
  const buffer = await getStream.buffer(
    s3
      .getObject({ Bucket: process.env.BUCKET_NAME!, Key: rawKey })
      .createReadStream()
  );

  // 동일 사진을 다시 최적화하는 작업을 막기 위해, 사진 키를 MD5 해시 값으로 사용한다.
  const hash = crypto.createHash("md5").update(buffer).digest("hex");
  const filePath = `/tmp/${hash}.jpg`;
  fs.writeFileSync(filePath, buffer);

  // 이제 resultKey는 "photo/" 접두사를 가져야 한다.
  const resultKey = `photo/${hash}.jpg`;
  const cdnURL = `https://${process.env.SUB_DOMAIN}.${process.env.ROOT_DOMAIN}/${resultKey}`;
  try {
    // 이미 동일한 사진이 존재하면 바로 CDN 주소를 반환한다.
    if (await s3Exists(process.env.BUCKET_NAME!, resultKey)) {
      return { cdnURL };
    }
    // jpegoptim 실행 파일을 준비하고, 최적화를 수행한다.
    await unpackJpegoptim();
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
    return { cdnURL };
  } finally {
    // 작업 임시 파일을 삭제하여 Lambda 인스턴스 재사용 시에 /tmp의 용량 부족이
    // 발생하지 않도록 한다.
    fs.unlinkSync(filePath);

    // 원본 사진 파일을 삭제하여 불필요한 S3 Bucket 용량 점유를 막는다.
    await s3
      .deleteObject({ Bucket: process.env.BUCKET_NAME!, Key: rawKey })
      .promise();
  }
};

async function s3Exists(bucketName: string, key: string): Promise<boolean> {
  try {
    // headObject로 객체의 메타데이터를 조회하여 객체의 존재 여부를 판단한다.
    await s3.headObject({ Bucket: bucketName, Key: key }).promise();
    return true;
  } catch (error: any) {
    // s3:ListObject 권한을 부여하지 않기 때문에 NotFound 대신
    // Forbidden으로 부재 여부를 판단해야 한다.
    if (error.code === "Forbidden") {
      return false;
    }
    throw error;
  }
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
