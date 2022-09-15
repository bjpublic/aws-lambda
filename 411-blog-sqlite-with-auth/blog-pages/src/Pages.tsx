import { Editor, GrantContext, PostList, Viewer } from "./Components";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Post, PostListItem } from "./models";
import {
  createPost,
  deletePost,
  fetchPost,
  fetchPostListItems,
  updatePost,
} from "./server";

import React from "react";

// "글 목록"을 보여주기 위한 페이지 컴포넌트.
export function PostListPage() {
  // "글 목록"을 관리하기 위한 React 상태를 선언.
  const [postItems, setPostItems] = React.useState<PostListItem[]>([]);
  React.useEffect(
    () => {
      // "글 목록" 조회 API를 부르고 그 결과를 "postItems" 상태에 넣는다.
      fetchPostListItems().then(setPostItems).catch(alert);
    },
    // 이 컴포넌트가 사용되는 첫 번째 시점에만 글 목록을 갱신하도록 의존성을 설정한다.
    []
  );
  // "글 목록"을 보여주기 위한 컴포넌트에게 렌더링을 위임한다.
  return <PostList postItems={postItems} />;
}

// "글"을 보여주기 위한 페이지 컴포넌트.
export function PostViewPage() {
  // "글 제목"을 주소로부터 가져온다.
  const { title } = useParams<"title">();

  // "글"을 관리할 React 상태를 선언한다.
  const [post, setPost] = React.useState<Post | null>(null);

  // "title" 변수가 변경될 때 "글"을 조회해 "post" 상태에 넣는다.
  React.useEffect(
    () => {
      fetchPost(title!).then(setPost).catch(alert);
    },
    // 컴포넌트는 재사용될 수 있다. 이 때 "title" 변수가 바뀐다.
    // 따라서 "title"이 바뀔 때 "글"을 다시 조회한다.
    [title]
  );

  // 아직 "post"가 없다면 로딩 중이라 알려준다.
  // 단, 이 예제에서는 예외 처리를 고려하지 않기 때문에 잘못된 주소로 접근할 경우에도 이 화면이 나온다.
  if (!post) {
    return <p>불러오는 중...</p>;
  }

  // "글 보기" 컴포넌트에 렌더링을 위임한다.
  return <Viewer post={post} />;
}

// "새 글을 작성"하기 위한 페이지 컴포넌트.
export function PostNewPage() {
  const navigate = useNavigate();

  // "글 편집" 컴포넌트에 렌더링을 위임하고 이벤트를 처리한다.
  return (
    <Editor
      // "글 생성"이므로 수정할 "글"은 존재하지 않는다.
      post={null}
      // "저장" 버튼을 눌렀을 때, 글 생성 API를 호출하고 "글 보기" 페이지로 이동한다.
      onSave={(title, content) =>
        createPost(title, content)
          // 브라우저에서 뒤로가기 했을 때 다시 생성 페이지로 오는 것은 이상하므로,
          // "replace" 함수를 통해 히스토리를 치환해 생성 페이지로 오지 못하도록 한다.
          .then(() => navigate(`/${title}`, { replace: true }))
          .catch(alert)
      }
      // "취소" 버튼을 누르면 이전 페이지로 이동한다.
      onCancel={() => navigate(-1)}
      // "글 생성" 페이지에서는 "삭제" 버튼이 없다. 무시한다.
      onDelete={() => {}}
    />
  );
}

// "글을 수정"하기 위한 페이지 컴포넌트.
export function PostEditPage() {
  const navigate = useNavigate();

  // "글 제목"을 주소로부터 가져온다.
  const { title } = useParams<{ title: string }>();

  // "글"을 관리할 React 상태를 선언한다.
  const [post, setPost] = React.useState<Post | null>(null);

  // "title" 변수가 변경될 때 "글"을 조회해 "post" 상태에 넣는다.
  // 이 때 권한이 없는 유저가 접근할 때는 굳이 조회하지 않는다.
  React.useEffect(
    () => {
      fetchPost(title!).then(setPost).catch(alert);
    },
    // 컴포넌트는 재사용될 수 있다. 이 때 "title" 변수가 바뀐다.
    // 따라서 글 제목이 변수가 변경되었을 때만 "글"을 다시 조회한다.
    [title]
  );

  // 아직 "post"가 없다면 로딩 중이라 알려준다.
  // 단, 이 예제에서는 예외 처리를 고려하지 않기 때문에 잘못된 주소로 접근할 경우에도 이 화면이 나온다.
  if (!post) {
    return <p>불러오는 중...</p>;
  }

  // "글 편집" 컴포넌트에 렌더링을 위임하고 이벤트를 처리한다.
  return (
    <Editor
      post={post}
      onSave={(title, content) =>
        // "저장" 버튼을 눌렀을 때, 글 수정 API를 호출하고 "글 보기" 페이지로 이동한다.
        updatePost(post.title, title, content)
          // 브라우저에서 뒤로가기 했을 때 다시 생성 페이지로 오는 것은 이상하므로,
          // "replace" 함수를 통해 히스토리를 치환해 생성 페이지로 오지 못하도록 한다.
          .then(() => navigate(`/${title}`, { replace: true }))
          .catch(alert)
      }
      // "취소" 버튼을 누르면 이전 페이지로 이동한다.
      onCancel={() => navigate(-1)}
      onDelete={() =>
        // 글 삭제 API를 요청하고, "글 목록" 페이지로 이동한다.
        // 뒤로가기에 의해 수정 페이지로 다시 오는걸 막기 위해 "replace"를 사용한다.
        deletePost(post.title)
          .then(() => navigate(`/`, { replace: true }))
          .catch(alert)
      }
    />
  );
}

// 운영자 권한이 있을 때만 children을 노출하기 위한 페이지 컴포넌트.
export function AdminPage({ children }: { children: React.ReactNode }) {
  const { admin } = React.useContext(GrantContext);
  if (!admin) {
    // 운영자 권한이 없다면 children 대신 접근 불가 화면을 표시한다.
    return (
      <div>
        <p>접근할 수 없습니다.</p>
        <Link to="/">돌아가기</Link>
      </div>
    );
  }
  // 운영자 권한이 있을 때만 넘겨받은 children을 표시한다.
  // React.Fragment로 감싸서 제대로 된 JSX로 반환하도록 구성한다.
  return <>{children}</>;
}
