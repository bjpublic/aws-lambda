# 601-websocket-echo

웹 소켓 API의 에코 예제. 웹 소켓으로 전달한 메시지를 그대로 되돌려준다.

## 환경

- Node.js v14
- Serverless Framework 3
- TypeScript 4.7.4
- Webpack 5.74.0
- Serverless Webpack 5.8.0
- ts-node 10.9.1
- AWSSDK 2.1055.0
- serverless-offline 9.2.0
- wscat 5.2.0

## 빌드

```bash
$ sls package
```

## 로컬 실행

```bash
$ sls offline
```

## 배포

```bash
$ sls deploy
```

## 테스트

```bash
# 로컬 테스트
$ wscat -c "ws://localhost:3000"

# 배포된 주소 테스트
$ wscat -c "wss://WS_ID.execute-api.AWS_REGION.amazonaws.com/dev"
```

## 제거

```bash
$ sls remove
```
