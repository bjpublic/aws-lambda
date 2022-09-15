# 402-blog-dynamodb

블로그 예제의 기반 구현. 글에 대한 CRUD HTTP API를 서버리스 스택으로 구현한다. 저장소는 DynamoDB를 사용한다.

- `401-blog-baseline`의 기반에 `storage.ts`만 DynamoDB를 사용하도록 구현한다.

독자적인 서버리스 스택 이름을 갖는다. 배포 시 이름 충돌이 발생하지 않는다.

## 환경

- Node.js v14
- Serverless Framework 3
- TypeScript 4.7.4
- Webpack 5.74.0
- Serverless Webpack 5.8.0
- ts-node 10.9.1
- AWSSDK 2.1055.0
- fast-equals 4.0.1
- serverless-dynamodb-local 0.2.40
- serverless-offline 9.2.0

## 빌드

```bash
$ sls package
```

## 로컬 실행

```bash
$ bash start-dynamodb.sh
$ sls offline
```

## 배포

```bash
$ sls deploy
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
$ sls remove
```
