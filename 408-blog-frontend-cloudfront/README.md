# 408-blog-frontend-cloudfront

SQLite를 사용하는 블로그 예제에 프론트엔드 웹 페이지를 서비스하기 위한 CloudFront를 도입하는 예제이다.

- `blog-api`는 블로그 서비스 API의 서버리스 구현체이다.
- `blog-pages`는 블로그 프론트엔드 React 구현체이다.
- `cdn-stack-cors`는 S3 Bucket을 통해 프론트엔드만 CloudFront로 서비스하고, 블로그 API는 CORS를 허용해 연동하는 방식이다.
- `cdn-stack-same-origin`은 블로그 서비스 API와 프론트엔드 페이지를 각각 오리진으로 하여 하나의 CloudFront로 서비스하는 방식이다.
