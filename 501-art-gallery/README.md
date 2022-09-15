# 501-art-gallery

아트 갤러리 예제. 5개의 하위 프로젝트로 예제를 구성한다.

## 프로젝트 구성

- `website`는 데모를 위한 임의의 데이터를 가진 정적 웹 페이지 프로젝트이다.
  - 임의의 데이터는 `assets` 디렉토리에서 생성한다.
- `service-api`는 서비스 API 프로젝트이다. 좋아요 API를 가진다.
- `train`은 좋아요 이벤트를 SQS로부터 조회해 Word2vec 모델을 구성하는 프로젝트이다.
- `recommend-api`는 추천 API 프로젝트이다. Word2vec 모델을 사용해 유사한 다른 작품 ID를 제공한다.
- `cdn-stack`은 웹 페이지와 API를 하나의 도메인으로 서비스하기 위한 서버리스 스택을 제공한다.

## 환경 변수

여러 프로젝트에서 공용으로 사용하는 환경 변수는 다음과 같다. 하위 디렉토리에서도 `.envrc` 파일을 설정하는 경우 `.envrc` 파일 안에 `source_up`을 사용한다.

| 변수              | 목적                                                              | 예시                   |
| ----------------- | ----------------------------------------------------------------- | ---------------------- |
| `BUCKET_NAME`     | 좋아요 이벤트 로그와 Word2vec 모델을 공유하기 위한 S3 Bucket 이름 | recommend-data-bucket  |
| `LIKE_QUEUE_NAME` | 좋아요 이벤트를 `train`으로 전달하기 위한 SQS 대기열의 이름       | art-gallery-like-queue |

## 로컬 실행

`service-api`, `recommend-api`를 실행한 후 `website`를 실행해야 한다. 이 때 `recommend-api`가 사용할 Word2vec 데이터도 다 준비되어 있어야 한다.

## 배포

`service-api`, `recommend-api`를 배포한 후 `cdn-stack`을 배포한다.

## 제거

`cdn-stack`을 제거한 후 `service-api`와 `recommend-api`를 제거한다.
