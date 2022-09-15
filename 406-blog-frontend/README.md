# 406-blog-frontend

블로그 예제의 프론트엔드 구현. React를 사용한다. [`create-react-app`](https://ko.reactjs.org/docs/create-a-new-react-app.html)으로부터 생성된 프로젝트이다.

## 환경

- Node.js v14
- React 18

## 로컬 실행

```bash
$ npm start
```

로컬 서버를 연결하기 위해, 적어도 다음 3개 중 하나의 예제의 로컬 서버를 기동해야 한다.

- `402-blog-dynamodb`
- `403-blog-mysql`
- `404-blog-sqlite`

## 빌드

```bash
$ npm run build
```

빌드 결과물을 서비스에 통합하려면 적어도 다음 프로젝트까지 진행해야 한다.

- `408-blog-frontend-cloudfront`
- `409-blog-frontend-apigw-integrated`
- `410-blog-frontend-apigw-integrated-rest-api`
- `411-blog-sqlite-with-auth`
