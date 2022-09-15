# 501-art-gallery-recommend-api

아트 갤러리의 추천 API. 학습 모듈이 S3 Bucket에 업로드한 Word2vec 모델을 가져와서 HTTP API 요청으로 들어온 작품 ID와 유사한 다른 작품 ID를 응답한다.

## 환경 변수

`.envrc.example` 파일을 참고해 `.envrc` 파일을 만들어 사용하면 편리하다. 상위 디렉토리의 `.envrc` 파일도 재귀적으로 참조하니 둘 다 설정해야 한다.

| 변수          | 목적                                                              | 예시                  |
| ------------- | ----------------------------------------------------------------- | --------------------- |
| `BUCKET_NAME` | 좋아요 이벤트 로그와 Word2vec 모델을 공유하기 위한 S3 Bucket 이름 | recommend-data-bucket |

## 빌드

테스트나 배포 전에 반드시 실행한다. 코드나 `template.yaml`의 변경점을 적용하려면 반드시 실행한다.

```bash
$ sam build
```

## 로컬 테스트

함수 개별 실행 테스트는 `sam local invoke` 명령을 사용한다.

```bash
$ sam local invoke "RecommendFunction" --event event.json
```

로컬 테스트 서버 실행을 위해서는 `sam local start-api` 명령을 사용한다.

```bash
$ sam local start-api --port 3001
```

## 배포

```bash
$ sam deploy --guided --parameter-overrides BucketName=${BUCKET_NAME}
```

## 테스트

배포 후 출력된 Endpoint 호출.

```bash
$ curl -XGET "https://URL_ID.lambda-url.AWS_REGION.on.aws/?id={ID}"
```

## ECR 생명주기 관리

```bash
$ aws ecr put-lifecycle-policy \
  --repository-name REPOSITORY_NAME \
  --lifecycle-policy-text file://lifecycle-policy.json
```

## 제거

```bash
# 스택 제거
$ sam delete
```
