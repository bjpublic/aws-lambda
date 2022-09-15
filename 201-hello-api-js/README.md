# 201-hello-world-js

Hello API의 JavaScript 구현 버전. `name`을 쿼리 파라미터로 받아 `Hello, name!`을 출력하는 HTTP API 서비스를 서버리스 스택으로 구현한다.

## 환경

- Node.js v14
- Serverless Framework 3

## 배포

```bash
$ sls deploy
```

## 테스트

```bash
$ curl "https://API_ID.execute-api.AWS_REGION.amazonaws.com/hello?name=lacti"
Hello, lacti!
```

## 제거

```bash
$ sls remove
```
