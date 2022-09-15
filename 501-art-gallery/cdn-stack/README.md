# 501-art-gallery-cdn-stack

아트 갤러리의 API와 웹 페이지를 제공하는 CDN. CloudFront가 서비스 API, 추천 API, S3 Bucket 3개를 오리진으로 사용한다. API는 모두 배포되어 있어야 하고, 웹 페이지는 빌드해 S3 Bucket에 업로드해야 한다.

## 환경

- Node.js v14
- Serverless Framework 3
- ts-node 10.9.1

## 환경 변수

`.envrc.example` 파일을 참고해 `.envrc` 파일을 만들어 사용하면 편리하다.

| 변수 이름            | 목적                                                                 | 예시                                                                              |
| -------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| WEBSITE_BUCKET_NAME  | 정적 웹 사이트 파일을 S3 Bucket 이름                                 | art-gallery-files                                                                 |
| ROOT_DOMAIN          | CloudFront에 부여할 루트 도메인                                      | lacti.link                                                                        |
| SUB_DOMAIN           | CloudFront에 부여할 서브 도메인                                      | art-gallery                                                                       |
| ACM_CERTIFICATE_ARN  | CloudFront가 사용할 도메인에 대한 인증서. us-east-1에 위치해야 한다. | arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/aebdbfab-5746-48f6-9dd4-8c305a7f95a1 |
| API_DOMAIN           | 서비스 API의 배포된 주소. https://는 생략한다.                       | API_ID.execute-api.AWS_REGION.amazonaws.com                                       |
| RECOMMEND_API_DOMAIN | 추천 API의 배포된 주소. https://는 생략한다.                         | API_ID.execute-api.AWS_REGION.amazonaws.com                                       |

## 배포

```bash
# 웹 페이지 빌드
$ cd website && npm run build

# 서비스 API 배포
$ cd service-api && sls deploy

# 추천 API 배포
$ cd recommend-api && sam deploy

# CDN 서버리스 스택 배포
$ cd cdn-stack && sls deploy
```

이후 웹 페이지만 변경되면 `sls deploy` 명령 대신 `sls s3sync` 명령만 사용해도 된다. 변경된 웹 페이지를 더 빠르게 배포할 수 있다.

```bash
# 웹 페이지 빌드
$ cd website && npm run build

# 서버리스 스택 배포
$ cd cdn-stack && sls s3sync
```

## 테스트

브라우저로 `https://SUB_DOMAIN.ROOT_DOMAIN`에 접속해 기능이 정상적으로 동작하는지 확인한다.

## 제거

```bash
$ sls remove
```
