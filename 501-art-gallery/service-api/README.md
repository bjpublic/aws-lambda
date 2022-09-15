# 501-art-gallery-service-api

아트 갤러리의 서비스 API. 추적 쿠기 발급, 좋아요 횟수 조회, 좋아요 API를 제공한다. Redis로 좋아요 횟수를 관리하고 좋아요 이벤트를 SQS로 전달한다.

## 환경

- Node.js v14
- Serverless Framework 3
- TypeScript 4.7.4
- Webpack 5.74.0
- Serverless Webpack 5.8.0
- ts-node 10.9.1
- AWSSDK 2.1055.0
- serverless-offline 9.2.0
- serverless-offline-sqs 6.0.0
- @redis/client 1.2.0

## 빌드

```bash
$ sls package
```

## 환경 변수

`.envrc.example` 파일을 참고해 `.envrc` 파일을 만들어 사용하면 편리하다. 상위 디렉토리의 `.envrc` 파일도 재귀적으로 참조하니 둘 다 설정해야 한다.

| 변수 이름  | 목적                                   | 예시                    |
| ---------- | -------------------------------------- | ----------------------- |
| REDIS_NAME | 잠금을 위해 사용할 Redis 인스턴스 이름 | lacti-simple-blog-redis |

## 로컬 실행

```bash
# 로컬 SQS 시작
$ bash start-sqs.sh

# 로컬 Redis 시작
$ bash start-redis.sh

# 로컬 테스트 서버 시작
$ sls offline
```

## 배포

```bash
$ sls deploy
```

### 데이터베이스 방화벽 열기

기본 보안그룹에 기본 VPC의 CIDR Block으부터 6379 포트 접근을 허용하는 스크립트를 실행한다. VPC를 제대로 구축해 사용하는 것이 좋다. VPC를 제대로 구축하는 방법은 7장 게임 개발 단원에서 다룬다.

```bash
$ bash scripts/securitygroup-default-allow-6379-for-vpc.sh
```

### VPC SQS 엔드포인트 생성

```bash
$ bash scripts/vpc-endpoint-sqs-create.sh
```

## 테스트

`cdn-stack`까지 배포한 후, 브라우저에서 `https://SUB_DOMAIN.ROOT_DOMAIN`으로 접속해 기능이 기대대로 동작하는지 확인한다.

## 제거

```bash
# VPC Endpoint 제거.
$ bash scripts/vpc-endpoint-s3-create.sh

# 스택 제거.
$ sls remove
```
