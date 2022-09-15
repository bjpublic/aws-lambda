# 302-photo-optimizer-two-buckets

사진 서비스 예제. S3 Bucket에 사진을 업로드하고 최적화 API를 수행하면 최적화된 사진을 S3 Bucket에 업로드한다. 사용자는 CloudFront를 통해 최적화된 사진을 다운로드한다. 301 예제와의 주된 차이점은 다음과 같다.

- `301-photo-optimizer` 예제는 API Gateway를 통해 사진을 직접 업로드해서 최적화를 처리한다.
- `302-photo-optimizer-two-buckets` 예제는 S3 Bucket의 Signed URL을 통해 사진을 업로드한 후 별도의 HTTP API를 호출해 최적화를 처리한다.

다른 예제와의 비교가 쉽도록 서버리스 스택 이름이 다르다. 예제를 배포할 때마다 새로운 스택이 배포되므로 주의가 필요하다.

사진 최적화를 위해 Lambda는 [`jpegoptim`](https://github.com/tjko/jpegoptim) 외부 명령을 사용한다. 정적 빌드 파일을 사용하거나 [`exodus`](https://github.com/intoli/exodus)로 실행 환경 전체를 압축한다.

## 환경

- Node.js v14
- Serverless Framework 3
- TypeScript 4.7.4
- Webpack 5.74.0
- Serverless Webpack 5.8.0
- ts-node 10.9.1
- tar 6.1.11
- get-stream 6.0.1
- AWSSDK 2.1055.0

## 빌드

```bash
$ sls package
```

## 환경 변수

`.envrc.example` 파일을 참고해 `.envrc` 파일을 만들어 사용하면 편리하다.

| 변수 이름           | 목적                                                                 | 예시                                                                              |
| ------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| BUCKET_NAME         | 최적화된 사진을 업로드하기 위한 S3 Bucket 이름                       | lacti-photo-optimizer                                                             |
| ROOT_DOMAIN         | CloudFront에 부여할 루트 도메인                                      | lacti.link                                                                        |
| SUB_DOMAIN          | CloudFront에 부여할 서브 도메인                                      | photo-optimizer                                                                   |
| ACM_CERTIFICATE_ARN | CloudFront가 사용할 도메인에 대한 인증서. us-east-1에 위치해야 한다. | arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/aebdbfab-5746-48f6-9dd4-8c305a7f95a1 |

## 배포

```bash
$ sls deploy
```

## 테스트

```bash
# 업로드할 주소 획득.
$ curl https://API_ID.execute-api.AWS_REGION.amazonaws.com/getSignedURL
{"photoKey":"16217569967590.3926911562181401","uploadURL":"https://BUCKET_NAME.s3.AWS_REGION.amazonaws.com/raw/16217569967590.3926911562181401?SIGNED_PARAMS"}

# 사진 업로드.
$ curl -T example.jpg "https://BUCKET_NAME.s3.AWS_REGION.amazonaws.com/raw/16217569967590.3926911562181401?SIGNED_PARAMS"

# 최적화 수행 API 실행.
$ curl -XPUT "https://API_ID.execute-api.AWS_REGION.amazonaws.com/optimizeAndUpload?photoKey=16217569967590.3926911562181401"
{"cdnURL":"https://SUB_DOMAIN.ROOT_DOMAIN/photo/b6243e148d2eaffe7cfd2d18ecaed629.jpg"}
```

## 제거

```bash
# 먼저 `BUCKET_NAME` Bucket 내의 모든 파일을 삭제한다.
$ aws s3 rm --recursive s3://${BUCKET_NAME}/

# 스택 제거.
$ sls remove
```
