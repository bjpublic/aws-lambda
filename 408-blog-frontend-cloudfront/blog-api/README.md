# 408-blog-frontend-cloudfront/blog-api

블로그 예제의 기반 구현. 글에 대한 CRUD HTTP API를 서버리스 스택으로 구현한다. 저장소는 SQLite를 사용한다. SQLite 데이터베이스 파일을 업로드하기 위해 S3 Bucket을 사용하고, 동시 수정 잠금을 위해 ElastiCache Redis를 사용한다.

`404-blog-sqlite` 프로젝트에 CORS 설정이 추가되었다. 서버리스 스택 이름이 `404-blog-sqlite`와 동일하므로 이 프로젝트를 배포하면 예전 배포를 덮어쓴다.

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

| 변수 이름         | 목적                                             | 예시                           |
| ----------------- | ------------------------------------------------ | ------------------------------ |
| REDIS_NAME        | 잠금을 위해 사용할 Redis 인스턴스 이름           | simple-blog-redis              |
| BUCKET_NAME       | SQLite 데이터베이스 파일을 보관할 S3 Bucket 이름 | simple-blog-sqlite-db          |
| CORS_ALLOW_ORIGIN | CORS를 허용할 오리진                             | https://SUB_DOMAIN.ROOT_DOMAIN |

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

## 제거

```bash
# VPC Endpoint 제거.
$ bash scripts/vpc-endpoint-s3-create.sh

# S3 Bucket 비움.
$ aws s3 rm --recursive s3://${BUCKET_NAME}/

# 스택 제거.
$ sls remove
```
