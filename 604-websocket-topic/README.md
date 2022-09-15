# 604-websocket-topic

웹 소켓 API의 주제-구독-전파 예제. 클라이언트가 연결한 후 주제를 구독하면 그 주제 안에서 발생한 메시지를 전파받는다. 클라이언트는 구독한 주제에 메시지를 발생할 수 있다.

- `6XX-websocket-topic*`은 모두 서버리스 스택 이름이 동일하다. 배포 시 이미 배포된 스택을 덮어쓴다.

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

## 환경 변수

`.envrc.example` 파일을 참고해 `.envrc` 파일을 만들어 사용하면 편리하다. 상위 디렉토리의 `.envrc` 파일도 재귀적으로 참조하니 둘 다 설정해야 한다.

| 변수 이름                   | 목적                                           | 예시                |
| --------------------------- | ---------------------------------------------- | ------------------- |
| CONNECTION_USER_TABLE_NAME  | 연결-사용자 관계를 관리할 DynamoDB 테이블 이름 | wt-connection-user  |
| USER_CONNECTION_TABLE_NAME  | 사용자-연결 관계를 관리할 DynamoDB 테이블 이름 | wt-user-connection  |
| USER_TOPIC_TABLE_NAME       | 사용자-주제 관계를 관리할 DynamoDB 테이블 이름 | wt-user-topic       |
| TOPIC_CONNECTION_TABLE_NAME | 주제-연결 관계를 관리할 DynamoDB 테이블 이름   | wt-topic-connection |

## 로컬 실행

```bash
$ bash start-dynamodb.sh
$ sls offline
```

## 로컬 테스트

```bash
# 사용자 및 주제 생성
$ curl -XPOST localhost:3000/user/client1
$ curl -XPOST localhost:3000/user/client2
$ curl -XPOST localhost:3000/topic/topic1

# 사용자1 구독 후 메시지 발행 및 수신
$ wscat -c "ws://localhost:3001" -H "x-user-id: client1"
< {"type":"subscribe","topic":"topic1"}
< {"type":"talk","topic":"topic1","text":"Hello!"}
> {"type":"talk","topic":"topic1","sender":"client1","text":"Hello!"}

# 사용자2 구독 후 메시지 수신
$ wscat -c "ws://localhost:3001" -H "x-user-id: client2"
< {"type":"subscribe","topic":"topic1"}
> {"type":"talk","topic":"topic1","sender":"client1","text":"Hello!"}
```

## 배포

```bash
$ sls deploy
```

## 테스트

로컬 테스트의 내용을 배포된 API 주소로 바꿔서 진행한다.

## 제거

```bash
$ sls remove
```
