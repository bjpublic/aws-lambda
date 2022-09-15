# 701-game-server

뱀 게임 예제의 서버. VPC를 구성하고 Redis 인스턴스를 할당한다. Redis 인스턴스를 활용해 매칭과 게임 이벤트 대기열을 구축하고 WebSocket API을 통해 클라이언트와 게임을 진행한다. 게임 로직을 처리하기 위한 Lambda는 비동기로 실행된다.

## 환경

- Node.js v14
- Serverless Framework 3
- TypeScript 4.7.4
- Webpack 5.74.0
- Serverless Webpack 5.8.0
- ts-node 10.9.1
- AWSSDK 2.1055.0
- serverless-domain-manager 6.1.0
- serverless-offline 9.2.0
- @redis/client 1.2.0

## 빌드

```bash
$ sls package
```

## 환경 변수

`.envrc.example` 파일을 참고해 `.envrc` 파일을 만들어 사용하면 편리하다.

| 변수 이름               | 목적                                                        | 예시                          |
| ----------------------- | ----------------------------------------------------------- | ----------------------------- |
| VPC_NAME                | 게임 서버를 실행할 VPC 이름                                 | vpc-game                      |
| VPC_CIDR                | 게임 서버를 실행할 VPC의 CIDR Block                         | 10.0.0.0/16                   |
| PUBLIC_SUBNET1_CIDR     | 퍼블릿 서브넷 1번의 CIDR Block                              | 10.0.0.0/20                   |
| PUBLIC_SUBNET2_CIDR     | 퍼블릿 서브넷 2번의 CIDR Block                              | 10.0.32.0/20                  |
| PRIVATE_SUBNET1_CIDR    | 프라이빗 서브넷 1번의 CIDR Block                            | 10.0.16.0/20                  |
| PRIVATE_SUBNET2_CIDR    | 프라이빗 서브넷 2번의 CIDR Block                            | 10.0.48.0/20                  |
| REDIS_NAME              | 매칭과 게임 이벤트 대기열을 위해 사용할 Redis 인스턴스 이름 | game-redis                    |
| REDIS_SUBNET_GROUP_NAME | Redis 인스턴스를 위한 서브넷 그룹 이름                      | vpc-game-private-subnet-group |
| ROOT_DOMAIN             | WebSocket API 사용자 지정 도메인에 부여할 루트 도메인       | lacti.link                    |
| SUB_DOMAIN              | WebSocket API 사용자 지정 도메인에 부여할 서브 도메인       | snake-ws                      |

## 로컬 테스트

```bash
$ bash start-redis.sh
$ sls offline
```

## 배포

```bash
$ sls create_domain
$ sls deploy
```

## 테스트

`cdn-stack`까지 배포한 후, 브라우저에서 `https://SUB_DOMAIN.ROOT_DOMAIN`으로 접속해 기능이 기대대로 동작하는지 확인한다.

## 제거

```bash
$ sls remove
$ sls delete_domain
```
