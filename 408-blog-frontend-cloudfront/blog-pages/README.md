# 408-blog-frontend-cloudfront/blog-pages

블로그 예제의 프론트엔드 구현. `cors`와 `same-origin`에 대한 빌드 설정을 제외하고는 `407-blog-frontend-router`와 완전히 동일한 코드 및 구성을 갖는다.

## 환경

- Node.js v14
- React 18
- React Router 6

## 로컬 실행

```bash
$ npm start
```

로컬 서버를 연결하기 위해 `blog-api` 프로젝트의 로컬 서버를 기동한다.

## 빌드

```bash
# cdn-stack-cors와 통합
$ npm run build:cors

# cdn-stack-same-origin와 통합
$ npm run build:same-origin
```

빌드 결과물은 `cdn-stack-stack-cors`와 `cdn-stack-same-origin`에 선언된 서버리스 스택에 통합된다.
