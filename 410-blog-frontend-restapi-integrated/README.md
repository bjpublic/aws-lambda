# 410-blog-frontend-restapi-integrated

SQLite를 사용하는 블로그 예제를 REST API로 바꾸고, REST API에서 직접 웹 페이지 결과물을 전달하기 위한 예제이다.

- `blog-api`는 블로그 서비스 API의 서버리스 구현체이다. 정적 웹 파일을 서비스한다. REST API를 사용하고 X-Ray를 통해 실행 시간을 측정한다.
- `blog-pages`는 블로그 프론트엔드 React 구현체이다.
