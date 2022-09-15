# 304-photo-optimizer-s3-event-production

사진 서비스 예제. S3 Bucket에 사진을 업로드하면 그 이벤트로 최적화가 처리되어 결과를 S3 Bucket에 업로드한다. 사용자는 CloudFront를 통해 최적화된 사진을 다운로드한다. 303 예제와의 주된 차이점은 다음과 같다.

- 전송 가속화(`AccelerateConfiguration`)를 구성
- 오래된 객체를 자동으로 삭제하기 위해 S3 Bucket의 객체 생명주기 정책(`LifecycleConfiguration`)을 구성
- 빠른 반응을 위해 동시성 준비(`provisionedConcurrency`) 구성

`303-photo-optimizer-s3-event`과 서버리스 스택 이름이 동일하므로, 이 프로젝트를 배포하면 이전 배포를 덮어쓴다.

사진 최적화를 위해 Lambda는 [`jpegoptim`](https://github.com/tjko/jpegoptim) 외부 명령을 사용한다. 정적 빌드 파일을 사용하거나 [`exodus`](https://github.com/intoli/exodus)로 실행 환경 전체를 압축한다.

## 환경

- Node.js v14
- Serverless Framework 3
- TypeScript 4.7.4
- Webpack 5.74.0
- Source Map Support 0.5.21
- ts-node 10.9.1
- tar 6.1.11
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
{"cdnURL":"https://SUB_DOMAIN.ROOT_DOMAIN/photo/b6243e148d2eaffe7cfd2d18ecaed629.jpg","uploadURL":"https://BUCKET_NAME.s3.AWS_REGION.amazonaws.com/raw/16217569967590.3926911562181401?SIGNED_PARAMS"}

# 사진 업로드.
$ curl -T example.jpg "https://BUCKET_NAME.s3.AWS_REGION.amazonaws.com/raw/16217569967590.3926911562181401?SIGNED_PARAMS"

# 잠시 대기 후, 앞서 획득한 cdnURL로 결과를 확인.
```

## 제거

```bash
# 먼저 `BUCKET_NAME` Bucket 내의 모든 파일을 삭제한다.
$ aws s3 rm --recursive s3://${BUCKET_NAME}/

# 스택 제거.
$ sls remove
```
