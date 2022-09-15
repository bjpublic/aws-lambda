# 409-blog-frontend-apigw-integrated-blog-api

블로그 예제의 기반 구현. `404-blog-sqlite`에 웹 페이지(`blog-pages`) 빌드 결과물(`build`)을 함께 제공하기 위한 `serveStatic` HTTP API가 추가된다.

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

## 빌드

```bash
$ sls package
```

## 환경 변수

`.envrc.example` 파일을 참고해 `.envrc` 파일을 만들어 사용하면 편리하다.

| 변수 이름   | 목적                                                | 예시                    |
| ----------- | --------------------------------------------------- | ----------------------- |
| REDIS_NAME  | 잠금을 위해 사용할 Redis 인스턴스 이름              | lacti-simple-blog-redis |
| BUCKET_NAME | SQLite 데이터베이스 파일을 보관할 S3 Bucket 이름    | simple-blog-sqlite-db   |
| ROOT_DOMAIN | API Gateway 사용자 지정 도메인에 부여할 루트 도메인 | lacti.link              |
| SUB_DOMAIN  | API Gateway 사용자 지정 도메인에 부여할 서브 도메인 | blog                    |

## 로컬 실행

```bash
$ bash start-redis.sh
$ sls offline
```

브라우저에서 `http://localhost:3000`으로 접속해 기능이 기대대로 동작하는지 확인한다.

## 배포

```bash
$ sls create_domain
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

브라우저에서 `https://SUB_DOMAIN.ROOT_DOMAIN`으로 접속해 기능이 기대대로 동작하는지 확인한다.

## 제거

```bash
# VPC Endpoint 제거.
$ bash scripts/vpc-endpoint-s3-create.sh

# S3 Bucket 비움.
$ aws s3 rm --recursive s3://${BUCKET_NAME}/

# 스택 제거.
$ sls remove

# 도메인 제거.
$ sls delete_domain
```
