# 603-websocket-broadcast

웹 소켓 API의 메시지 전파(Broadcast) 예제. 연결한 모든 연결 ID를 DynamoDB Table에 보관하고, 메시지가 들어오면 전체에게 전파한다.

다른 예제와 서버리스 스택 이름이 다르기 때문에 배포로 덮어써지는 경우는 없다.

## 환경

- Node.js v14
- Serverless Framework 3
- TypeScript 4.7.4
- Webpack 5.74.0
- Serverless Webpack 5.8.0
- ts-node 10.9.1
- AWSSDK 2.1055.0
- serverless-dynamodb-local 0.2.40
- serverless-offline 9.2.0
- wscat 5.2.0

## 빌드

```bash
$ sls package
```

## 로컬 실행

```bash
$ bash start-dynamodb.sh
$ sls offline
```

## 로컬 테스트

```bash
$ wscat -c ws://localhost:3001
Connected (press CTRL+C to quit)
> Hello!
< Hello!
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
