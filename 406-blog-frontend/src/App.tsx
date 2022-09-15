import { Editor, PostList, Viewer } from "./Components";
import { Post, PostListItem } from "./models";
import {
  createPost,
  deletePost,
  fetchPost,
  fetchPostListItems,
  updatePost,
} from "./server";

import React from "react";

// 렌더링할 최상위 컴포넌트. 페이지 렌더링의 진입점 함수.
export default function App() {
  // "글 목록"을 보여주기 위한 상태를 선언.
  const [postItems, setPostItems] = React.useState<PostListItem[]>([]);

  // 현재 조회, 수정하기 위한 "글" 정보를 관리하기 위한 상태를 선언.
  const [post, setPost] = React.useState<Post | null>(null);

  // 현재 보기 모드인지 수정 모드인지 관리하기 위한 상태를 선언.
  const [editMode, setEditMode] = React.useState<boolean>(false);

  // 글 목록을 새로고침하는 함수.
  // 함수의 결과로 "postItems" 상태가 갱신되며 렌더링이 다시 발생한다.
  function refreshPostList() {
    fetchPostListItems().then(setPostItems).catch(alert);
  }

  // 이 컴포넌트가 처음 렌더링 될 때 글 목록 상태를 갱신한다.
  React.useEffect(
    () => {
      refreshPostList();
    },
    // Effect의 의존성이 하나도 없다. 즉, Effect가 "처음" 실행된 이후 다시 실행되지 않는다.
    // 따라서 이 내용은 App 컴포넌트가 처음 VirtualDOM에 삽입될 때 한 번만 실행된다.
    []
  );

  // 보기 모드라면 글 화면과 글 목록 화면을 보여준다.
  if (!editMode) {
    // 현재 보고 있는 글이 있을 때, 글 화면을 보여준다.
    if (post) {
      return (
        <Viewer
          post={post}
          onStartEdit={() => setEditMode(true)}
          onBack={() => setPost(null)}
        />
      );
    }
    // 보기 모드인데 보고 있는 글이 없다면, 글 목록을 보여준다.
    return (
      <PostList
        postItems={postItems}
        onView={(title) => {
          // "글 보기"를 했을 때 보기 모드로 전환한다.
          setEditMode(false);
          // 선택한 "글 제목"으로부터 글 조회 API를 호출하고, "글" 상태를 갱신한다.
          fetchPost(title).then(setPost).catch(alert);
        }}
        onNew={() => {
          // 글을 새로 작성해야 하므로, 기존 "글" 정보를 초기화한다.
          setPost(null);

          // "수정 모드"로 진입하기 위해 상태를 변경한다.
          setEditMode(true);
        }}
      />
    );
  }
  // 수정 모드라면 글 편집 화면을 보여준다.
  return (
    <Editor
      post={post}
      onSave={(title, content) =>
        // 현재 보고 있는 "글" 정보의 유무에 따라 "수정"인지 "새 글 작성"인지 분기해 요청한다.
        (post
          ? updatePost(post.title, title, content)
          : createPost(title, content)
        )
          // "수정" 혹은 "작성한 새 글"의 정보를 서버로부터 새로 가져와 "글" 상태를 갱신한다.
          .then(() => fetchPost(title).then(setPost).catch(alert))
          // 수정을 완료했으니 다시 "보기 모드"로 넘어간다.
          .then(() => setEditMode(false))
          // 변경된 내용을 글 목록에도 적용하기 위해 "글 목록"을 새로고침한다.
          .then(() => refreshPostList())
          .catch(alert)
      }
      onCancel={() => setEditMode(false)}
      onDelete={() =>
        // 글 삭제 API를 요청한다.
        post
          ? deletePost(post.title)
              // 글을 삭제했으니 현재 작업 중인 "글" 정보를 초기화한다.
              .then(() => setPost(null))
              // "보기 모드"로 넘어간다.
              .then(() => setEditMode(false))
              // 글 목록에서 삭제된 대상을 제거하기 위해 "글 목록"을 새로고침한다.
              .then(() => refreshPostList())
              .catch(alert)
          : 0
      }
    />
  );
}
