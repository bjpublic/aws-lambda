# 411-blog-sqlite-with-auth-blog-page

블로그 예제의 프론트엔드 구현. 구글 인증 연동을 위해 `react-google-login` 라이브러리를 사용한다.

- `407-blog-frontend-router`을 기반으로 수정한 프로젝트다.
- `react-google-login` 의존성 버전 문제로 React 17을 사용한다.

## 환경

- Node.js v14
- React 17
- React Router 6
- react-google-login 5.2.2

## 로컬 실행

```bash
$ npm start
```

로컬 서버를 연결하기 위해 `blog-api` 프로젝트의 로컬 서버를 기동한다.

## 로컬 테스트

로컬 테스트 서버는 Lambda 권한 부여자를 지원하지 않으므로, `package.json`의 `proxy`를 이미 배포된 API의 주소로 변경한 후 테스트한다.

## 환경 변수

`.envrc.example` 파일을 참고해 `.envrc` 파일을 만들어 사용하면 편리하다.

| 변수 이름                  | 목적                     | 예시                                 |
| -------------------------- | ------------------------ | ------------------------------------ |
| REACT_APP_GOOGLE_CLIENT_ID | 구글 OAUTH 클라이언트 ID | CLIENT_ID.apps.googleusercontent.com |

## 빌드

```bash
$ npm run build
```

빌드 결과물은 `blog-api`에 의해 통합되어 함께 제공된다.
