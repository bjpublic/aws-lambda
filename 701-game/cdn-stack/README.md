# 701-game-cdn-stack

뱀 게임 웹 클라이언트에 대한 CDN을 구성하는 스택. 웹 페이지 결과물이 담긴 S3 Bucket을 제공하는 CloudFront를 구성한다.

## 환경

- Node.js v14
- Serverless Framework 3
- ts-node 10.9.1

## 환경 변수

`.envrc.example` 파일을 참고해 `.envrc` 파일을 만들어 사용하면 편리하다.

| 변수 이름           | 목적                                                                 | 예시                                                                              |
| ------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| WEBSITE_BUCKET_NAME | 정적 웹 사이트 파일을 S3 Bucket 이름                                 | snake-game-files                                                                  |
| ROOT_DOMAIN         | CloudFront에 부여할 루트 도메인                                      | lacti.link                                                                        |
| SUB_DOMAIN          | CloudFront에 부여할 서브 도메인                                      | snake-game                                                                        |
| ACM_CERTIFICATE_ARN | CloudFront가 사용할 도메인에 대한 인증서. us-east-1에 위치해야 한다. | arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/aebdbfab-5746-48f6-9dd4-8c305a7f95a1 |

## 배포

```bash
# 웹 클라이언트 빌드
$ cd client && npm run build

# CDN 서버리스 스택 배포
$ cd cdn-stack && sls deploy
```

이후 웹 페이지만 변경되면 `sls deploy` 명령 대신 `sls s3sync` 명령만 사용해도 된다. 변경된 웹 페이지를 더 빠르게 배포할 수 있다.

```bash
# 웹 클라이언트 빌드
$ cd client && npm run build

# 서버리스 스택 배포
$ cd cdn-stack && sls s3sync
```

## 테스트

브라우저로 `https://SUB_DOMAIN.ROOT_DOMAIN`에 접속해 기능이 정상적으로 동작하는지 확인한다.

## 제거

```bash
$ sls remove
```
