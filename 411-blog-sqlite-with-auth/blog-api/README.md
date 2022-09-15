# 411-blog-sqlite-with-auth-blog-api

블로그 예제의 기반 구현. `404-blog-sqlite`에 Google OAuth 인증이 추가된다. 도메인은 CDN에 의해 부여되므로, API 스택은 사용자 지정 도메인을 사용하지 않는다.

독자적인 서버리스 스택 이름을 갖는다. 배포 시 이름 충돌이 발생하지 않는다.

## 환경

- Node.js v14
- Serverless Framework 3
- TypeScript 4.7.4
- Webpack 5.74.0
- Serverless Webpack 5.8.0
- ts-node 10.9.1
- AWSSDK 2.1055.0
- serverless-offline 9.2.0
- better-sqlite3 7.6.2
- @redis/client 1.2.0
- Fast JSON Web Token 1.7.0
- Fork TS Checker Webpack Plugin 7.2.13

## 빌드

```bash
$ sls package
```

## 환경 변수

`.envrc.example` 파일을 참고해 `.envrc` 파일을 만들어 사용하면 편리하다.

| 변수 이름      | 목적                                             | 예시                    |
| -------------- | ------------------------------------------------ | ----------------------- |
| REDIS_NAME     | 잠금을 위해 사용할 Redis 인스턴스 이름           | lacti-simple-blog-redis |
| BUCKET_NAME    | SQLite 데이터베이스 파일을 보관할 S3 Bucket 이름 | simple-blog-sqlite-db   |
| JWT_SECRET_KEY | JWT의 유효성 검증을 위한 비밀 키                 | verysecret              |
| ADMIN_EMAIL    | 로그인을 허용할 이메일 주소                      | admin@lacti.link        |

## 배포

```bash
$ sls deploy
```

### 데이터베이스 방화벽 열기

기본 보안그룹에 기본 VPC의 CIDR Block으부터 6379 포트 접근을 허용하는 스크립트를 실행한다. VPC를 제대로 구축해 사용하는 것이 좋다. VPC를 제대로 구축하는 방법은 7장 게임 개발 단원에서 다룬다.

```bash
$ bash scripts/securitygroup-default-allow-6379-for-vpc.sh
```

### VPC S3 엔드포인트 생성

```bash
$ bash scripts/vpc-endpoint-s3-create.sh
```

## 테스트

`cdn-stack`까지 배포한 후, 브라우저에서 `https://SUB_DOMAIN.ROOT_DOMAIN`으로 접속해 기능이 기대대로 동작하는지 확인한다.

## 제거

```bash
# VPC Endpoint 제거.
$ bash scripts/vpc-endpoint-s3-create.sh

# S3 Bucket 비움.
$ aws s3 rm --recursive s3://${BUCKET_NAME}/

# 스택 제거.
$ sls remove
```
