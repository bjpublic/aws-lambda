# 411-blog-sqlite-with-auth

SQLite를 사용하는 블로그 예제에 Lambda 권한 부여자를 통한 인증을 추가한다. 구글 OAuth를 연동한다.

- `blog-api`는 블로그 서비스 API의 서버리스 구현체이다.
- `blog-pages`는 블로그 프론트엔드 React 구현체이다.
- `cdn-stack`은 블로그 API와 프론트엔드를 CloudFront로 서비스하기 위한 서버리스 스택이다.
