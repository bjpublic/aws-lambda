# 501-art-gallery-train

아트 갤러리의 학습 모듈. 서비스 API가 남긴 좋아요 이벤트를 SQS로부터 가져와 로그 파일을 구성하고, 로그 데이터로부터 Word2vec 모델을 학습해 S3 Bucket에 업로드한다.

수행 시간이 길고 큰 저장소 공간이 필요하기 때문에 서버리스 스택으로 배포하지 않는다. EC2 인스턴스나 로컬 개발 환경에서 직접 실행한다.

# 환경 변수

이 프로젝트에서 관리하는 환경 변수는 없다. 다만 상위 디렉토리에서 관리하는 `BUCKET_NAME`, `LIKE_QUEUE_NAME` 환경 변수가 잘 선언되어 있어야 한다.

## 가짜 데이터 생성

```bash
$ node generate-random-logs.js
```

## S3 Bucket 생성

```bash
$ bash s3-bucket-create.sh
```

## 학습 실행

```bash
$ virtualenv venv
$ source venv/bin/activate
(venv) $ pip install -r requirements.txt
(venv) $ python main.py
```

## 추론 테스트

```bash
$ source venv/bin/activate
(venv) $ python predict.py
```
