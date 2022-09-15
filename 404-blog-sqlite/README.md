# 404-blog-sqlite

블로그 예제의 기반 구현. 글에 대한 CRUD HTTP API를 서버리스 스택으로 구현한다. 저장소는 SQLite를 사용한다. SQLite 데이터베이스 파일을 업로드하기 위해 S3 Bucket을 사용하고, 동시 수정 잠금을 위해 ElastiCache Redis를 사용한다.

- `401-blog-baseline`의 기반에 `storage.ts`만 SQLite를 사용하도록 구현한다.

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

| 변수 이름   | 목적                                             | 예시                  |
| ----------- | ------------------------------------------------ | --------------------- |
| REDIS_NAME  | 잠금을 위해 사용할 Redis 인스턴스 이름           | simple-blog-redis     |
| BUCKET_NAME | SQLite 데이터베이스 파일을 보관할 S3 Bucket 이름 | simple-blog-sqlite-db |

## 로컬 실행

```bash
$ bash start-redis.sh
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

### VPC S3 엔드포인트 생성

```bash
$ bash scripts/vpc-endpoint-s3-create.sh
```

## 테스트

```bash
export API_URL="https://localhost:3000"  # 로컬 테스트
export API_URL="https://API_ID.execute-api.AWS_REGION.amazonaws.com"  # 배포 테스트

# 새 글 생성.
$ curl -XPOST "${API_URL}/post" \
  -H "Content-Type: application/json" \
  -d '{"title":"테스트","content":"블로그를 시작합니다"}'
# 새 글이 추가되고, 결과로 제목이 반환된다.
{"title":"테스트"}

# 글 목록 조회.
$ curl -XGET "${API_URL}/post"
# "테스트" 글이 목록에 존재한다.
[{"title":"테스트","created":"2021-07-31T16:55:26.337Z"}]

# 글 내용 조회.
# 주소에 들어갈 제목을 Base64로 인코딩하기 위해 다음 명령을 사용한다.
# node -e "console.log(encodeURIComponent('테스트'))"
$ curl -XGET "${API_URL}/post/%ED%85%8C%EC%8A%A4%ED%8A%B8"
# 글 내용이 잘 반환된다.
{"content":"블로그를 시작합니다","created":"2021-07-31T16:55:26.337Z","title":"테스트"}

# 글 내용 수정.
# 글 제목과 내용을 함께 변경한다.
$ curl -XPUT "${API_URL}/post/%ED%85%8C%EC%8A%A4%ED%8A%B8" \
  -H "Content-Type: application/json" \
  -d '{"title":"첫 번째 글","content":"블로그를 시작합니다!"}'
# 변경된 글 제목 "첫 번째 글"이 반환된다.
{"title":"첫 번째 글"}

# 다시 글 목록 조회.
$ curl -XGET "${API_URL}/post"
# 변경된 제목이 글 목록에 잘 반영된다.
[{"title":"첫 번째 글","created":"2021-07-31T16:55:26.337Z"}]

# "테스트"로 글 내용 조회.
$ curl -I -XGET "${API_URL}/post/%ED%85%8C%EC%8A%A4%ED%8A%B8"
# 제목이 변경되었으므로 "테스트"로 조회하면 404가 반환된다.
HTTP/2 404
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
