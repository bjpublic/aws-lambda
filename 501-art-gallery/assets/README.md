# 501-art-gallery-assets

아트 갤러리에서 사용하는 임의의 데이터를 생성한다.

## 이미지 파일 다운로드

<https://thisartworkdoesnotexist.com>에서 임의의 이미지를 다운로드한다. 다운로드한 이미지는 `website/public/images`에 위치한다.

```bash
$ bash download-art-images.sh 1000
```

반드시 데이터는 천천히 다운로드한다. 그리고 너무 많은 데이터 다운로드를 요청하지 않아야 한다. 이미 예제에 테스트 데이터를 구성했으므로 굳이 추가로 다운로드할 필요는 없다.

## 메타데이터 생성

`website/public/images`에 위치한 파일을 기준으로 `website/src/data.json` 파일을 생성한다.

```bash
$ virtualenv venv
$ source venv/bin/activate
(venv) $ pip install -r requirements.txt
(venv) $ python generate-art-metadata.py
```
