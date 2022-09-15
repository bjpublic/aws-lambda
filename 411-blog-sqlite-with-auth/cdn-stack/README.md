# 411-blog-sqlite-with-auth-cdn-stack

블로그 API와 웹 페이지를 같은 도메인으로 운영하는 예제. CloudFront가 API Gateway와 S3 Bucket 2개를 오리진으로 사용한다. `blog-pages`를 `npm run build` 명령으로 빌드해야 한다. `blog-api`와 `blog-pages`는 구글 인증을 지원한다.

## 환경

- Node.js v14
- Serverless Framework 3
- ts-node 10.9.1

## 환경 변수

`.envrc.example` 파일을 참고해 `.envrc` 파일을 만들어 사용하면 편리하다.

| 변수 이름           | 목적                                                                 | 예시                                                                              |
| ------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| WEBSITE_BUCKET_NAME | 웹 페이지를 업로드하기 위한 S3 Bucket 이름                           | lacti-simple-blog-files                                                           |
| ROOT_DOMAIN         | CloudFront에 부여할 루트 도메인                                      | lacti.link                                                                        |
| SUB_DOMAIN          | CloudFront에 부여할 서브 도메인                                      | blog                                                                              |
| ACM_CERTIFICATE_ARN | CloudFront가 사용할 도메인에 대한 인증서. us-east-1에 위치해야 한다. | arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/aebdbfab-5746-48f6-9dd4-8c305a7f95a1 |
| API_DOMAIN          | 블로그 API의 배포된 주소. https://는 생략한다.                       | API_ID.execute-api.AWS_REGION.amazonaws.com                                       |

## 배포

```bash
# 웹 페이지 빌드
$ cd blog-pages
blog-pages$ npm run build

$ cd blog-api
blog-api$ sls deploy

# 서버리스 스택 배포
$ cd cdn-stack-same-origin
cdn-stack-same-origin$ sls deploy
```

이후 웹 페이지만 변경되면 `sls deploy` 명령 대신 `sls s3sync` 명령만 사용해도 된다. 변경된 웹 페이지를 더 빠르게 배포할 수 있다.

```bash
# 웹 페이지 빌드
$ cd blog-pages
blog-pages$ npm run build

# 서버리스 스택 배포
$ cd cdn-stack-cors
cdn-stack-cors$ sls s3sync
```

## 테스트

브라우저로 `https://SUB_DOMAIN.ROOT_DOMAIN`에 접속해 기능이 정상적으로 동작하는지 확인한다.

## 제거

```bash
$ sls remove
```
