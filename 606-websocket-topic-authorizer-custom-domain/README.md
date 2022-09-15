# 606-websocket-topic-authorizer-custom-domain

웹 소켓 API의 인증-주제-구독-전파에 사용자 지정 도메인을 추가한 예제. `605-websocket-topic-authorizer` 예제의 WebSocket API에 사용자 지정 도메인을 추가했다.

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
- serverless-domain-manager 6.1.0
- serverless-offline 9.2.0
- wscat 5.2.0

## 빌드

```bash
$ sls package
```

## 환경 변수

`.envrc.example` 파일을 참고해 `.envrc` 파일을 만들어 사용하면 편리하다. 상위 디렉토리의 `.envrc` 파일도 재귀적으로 참조하니 둘 다 설정해야 한다.

| 변수 이름                   | 목적                                                | 예시                |
| --------------------------- | --------------------------------------------------- | ------------------- |
| USER_CONNECTION_TABLE_NAME  | 사용자-연결 관계를 관리할 DynamoDB 테이블 이름      | wt-user-connection  |
| USER_TOPIC_TABLE_NAME       | 사용자-주제 관계를 관리할 DynamoDB 테이블 이름      | wt-user-topic       |
| TOPIC_CONNECTION_TABLE_NAME | 주제-연결 관계를 관리할 DynamoDB 테이블 이름        | wt-topic-connection |
| ROOT_DOMAIN                 | API Gateway 사용자 지정 도메인에 부여할 루트 도메인 | lacti.link          |
| SUB_DOMAIN                  | API Gateway 사용자 지정 도메인에 부여할 서브 도메인 | blog                |

## 로컬 실행

```bash
$ bash start-dynamodb.sh
$ sls offline
```

## 로컬 테스트

serverless-offline 플러그인은 Lambda 권한 부여자를 지원하지 않는다. 로컬에서 테스트할 수 없다.

## 배포

```bash
$ sls create_domain
$ sls deploy
```

## 테스트

```bash
# 사용자 및 주제 생성
$ curl -XPOST https://API_ID.execute-id.AWS_REGION.amazonaws.com/user/client1
$ curl -XPOST https://API_ID.execute-id.AWS_REGION.amazonaws.com/user/client2
$ curl -XPOST https://API_ID.execute-id.AWS_REGION.amazonaws.com/topic/topic1

# 사용자1 구독 후 메시지 발행 및 수신
$ wscat -c "wss://SUB_DOMAIN.ROOT_DOMAIN/dev?token=client1"
< {"type":"subscribe","topic":"topic1"}
< {"type":"talk","topic":"topic1","text":"Hello!"}
> {"type":"talk","topic":"topic1","sender":"client1","text":"Hello!"}

# 사용자2 구독 후 메시지 수신
$ wscat -c "wss://SUB_DOMAIN.ROOT_DOMAIN/dev?token=client2"
< {"type":"subscribe","topic":"topic1"}
> {"type":"talk","topic":"topic1","sender":"client1","text":"Hello!"}
```

## 제거

```bash
$ sls remove
$ sls delete_domain
```
