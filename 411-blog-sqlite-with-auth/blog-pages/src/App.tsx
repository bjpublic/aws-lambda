import {
  AdminPage,
  PostEditPage,
  PostListPage,
  PostNewPage,
  PostViewPage,
} from "./Pages";
import { GrantContext, LogInOutButton } from "./Components";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import { Grant } from "./models";
import React from "react";
import { requestGrant } from "./server";

// 렌더링할 최상위 컴포넌트. 페이지 렌더링의 진입점 함수.
export default function App() {
  // 허가 정보 "grant"를 관리하기 위한 상태를 선언한다.
  const [grant, setGrant] = React.useState<Grant>({
    email: null,
    admin: false,
  });

  // 페이지가 시작되었을 때 허가 정보를 획득하여 "grant" 상태에 보관한다.
  React.useEffect(() => {
    requestGrant().then(setGrant).catch(alert);
  }, []);

  return (
    <>
      {/* 로그인, 로그아웃 버튼을 최상단에 배치한다.
          이 컴포넌트는 GrantContext를 사용할 수 없으므로 "grant" 결과를 직접 사용한다. */}
      <LogInOutButton logged={!!grant.email} />

      {/* 하위 컴포넌트에서 "grant" 정보를 쉽게 사용할 수 있도록 ContextProvider를 설치한다. */}
      <GrantContext.Provider value={{ admin: grant.admin }}>
        <Router>
          <Routes>
            {/* 주소에 아무것도 없다면 "글 목록" 페이지를 보여준다. */}
            <Route path="*" element={<PostListPage />} />
            {/* "글 생성" 페이지의 주소를 "/_new"로 정한다.
                따라서 "_new"라는 제목의 글은 제대로 보이지 않는다. */}
            <Route
              path="/_new"
              element={
                <AdminPage>
                  <PostNewPage />
                </AdminPage>
              }
            />
            {/* "글 보기" 페이지의 주소는 "글 제목"이다. */}
            <Route path="/:title" element={<PostViewPage />} />
            {/* "글 수정" 페이지의 주소는 "글 제목" 뒤에 "/edit"를 붙인다. */}
            <Route
              path="/:title/edit"
              element={
                <AdminPage>
                  <PostEditPage />
                </AdminPage>
              }
            />
          </Routes>
        </Router>
      </GrantContext.Provider>
    </>
  );
}
