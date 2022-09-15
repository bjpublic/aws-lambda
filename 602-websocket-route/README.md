# 602-websocket-route

웹 소켓 API의 라우트 선택 표현식 활용 예제. `talk` 유형의 메시지만 응답하고 그 외의 경우 연결을 끊는다.

다른 예제와 서버리스 스택 이름이 다르기 때문에 배포로 덮어써지는 경우는 없다.

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

## 로컬 테스트

```bash
$ wscat -c ws://localhost:3001
Connected (press CTRL+C to quit)
> {"action":"talk","message":"Hello!"}
< {"message":"Hello!"}
> BREAK!
Disconnected (code: 1005, reason: "")
```

## 배포

```bash
$ sls deploy
```

## 테스트

```bash
$ wscat -c "wss://WS_ID.execute-api.AWS_REGION.amazonaws.com/dev"
```

## 제거

```bash
$ sls remove
```
