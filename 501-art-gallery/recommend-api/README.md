# 501-art-gallery-recommend-api

아트 갤러리의 추천 API. 학습 모듈이 S3 Bucket에 업로드한 Word2vec 모델을 가져와서 HTTP API 요청으로 들어온 작품 ID와 유사한 다른 작품 ID를 응답한다.

## 환경 변수

이 프로젝트에서 관리하는 환경 변수는 없다. 다만 상위 디렉토리에서 관리하는 `BUCKET_NAME` 환경 변수가 잘 선언되어 있어야 한다.

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

## ECR 생명주기 관리

```bash
$ aws ecr put-lifecycle-policy \
  --repository-name REPOSITORY_NAME \
  --lifecycle-policy-text file://lifecycle-policy.json
```

## 제거

```bash
# 스택 제거.
$ sam delete
```
