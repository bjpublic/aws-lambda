# 204-hello-world-ts-with-webpack-source-map-support

Hello API의 TypeScript 구현 버전. `name`을 쿼리 파라미터로 받아 `Hello, name!`을 출력하는 HTTP API 서비스를 서버리스 스택으로 구현한다.

- `203-hello-world-ts` 예제에서 `source-map-support` 패키지가 추가되었다. 그리고 Webpack의 `stats` 옵션을 `normal`로 지정해 빌드 시 로그를 확인한다.
- 서버리스 스택 이름이 `202-hello-world-ts`와 동일하다. 이 프로젝트를 배포하면 `202-hello-world-ts` 프로젝트의 배포를 덮어쓴다.

## 환경

- Node.js v14
- Serverless Framework 3
- TypeScript 4.7.4
- Webpack 5.74.0
- Serverless Webpack 5.8.0
- Source Map Support 0.5.21

## 빌드

```bash
$ sls package
```

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