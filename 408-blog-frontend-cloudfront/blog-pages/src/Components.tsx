import { Post, PostListItem } from "./models";

import { Link } from "react-router-dom";
import React from "react";
import { formatDate } from "./utils";
import nl2br from "react-nl2br";

// 글 목록을 보여주기 위한 컴포넌트.
export function PostList({ postItems }: { postItems: PostListItem[] }) {
  // 상태를 갖지 않고 전달 받은 값을 순수히 DOM으로 표현하기만 한다.
  // 이 때 발생하는 이벤트는 상위 컴포넌트에 이벤트 함수를 통해 위임한다.
  return (
    <div>
      <ul>
        {postItems.map((item) => (
          <li key={item.title}>
            <Link to={`/${item.title}`}>
              [{formatDate(item.created)}] {item.title}
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/_new">새 글</Link>
    </div>
  );
}

// date 문자열을 label과 함께 서식화된 문자열로 표현하기 위한 컴포넌트.
// 이 패턴이 많이 재사용되기 때문에 컴포넌트로 분리한다.
export function DateField({ label, date }: { label: string; date?: string }) {
  // 만약 date 값이 없다면 렌더링하지 않는다.
  if (!date) {
    return null;
  }
  // 두 개의 컴포넌트를 포함하는데, 별도의 상위 요소를 지정하고 싶지 않다면 <></>으로 감싼다.
  // 이는 React.Fragment의 약어로, 자식 목록을 상위 요소에 그대로 추가할 때 사용한다.
  return (
    <>
      <dt>{label}</dt>
      <dd>{formatDate(date)}</dd>
    </>
  );
}

// 글을 보여주기 위한 컴포넌트.
export function Viewer({ post }: { post: Post }) {
  // "PostList" 컴포넌트와 동일한 순수 함수 컴포넌트로,
  // 전달 받은 값을 렌더링하고 이벤트는 바깥으로 위임한다.
  return (
    <div>
      <h1>{post.title}</h1>
      <dl>
        <DateField label="생성" date={post.created} />
        <DateField label="수정" date={post.modified} />
        <dt>내용</dt>
        <dd>
          <p>{nl2br(post.content)}</p>
        </dd>
      </dl>
      {/* 버튼으로부터 발생하는 이벤트를 바깥으로 위임한다. */}
      <Link to="/">목록</Link>
      {/* Link 사이에 띄어쓰기를 넣어 약간 떨어지게 만들어준다. */}
      &nbsp;&nbsp;
      <Link to={`/${post.title}/edit`}>수정</Link>
    </div>
  );
}

// 글 생성, 수정 화면을 보여주기 위한 컴포넌트.
export function Editor({
  post,
  onSave,
  onCancel,
  onDelete,
}: {
  post: Post | null;
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  // input, textarea로 수정하는 값을 React에서 관리하기 위한 상태를 선언한다.
  // 만약 글 수정이라면, "post"를 통해 전달된 값을 초기 상태 값으로 사용한다.
  const [title, setTitle] = React.useState<string>(post?.title ?? "");
  const [content, setContent] = React.useState<string>(post?.content ?? "");
  return (
    <div>
      <dl>
        <dt>제목</dt>
        <dd>
          <input
            type="text"
            defaultValue={title}
            placeholder="글 제목"
            // input의 값이 변경되면 React의 "title" 상태를 갱신한다.
            onChange={(event) => setTitle(event.target.value)}
          />
        </dd>
        <DateField label="생성" date={post?.created} />
        <DateField label="수정" date={post?.modified} />
        <dt>내용</dt>
        <dd>
          <textarea
            defaultValue={content}
            placeholder="글 내용"
            // textarea의 값이 변경되면 React의 "content" 상태를 갱신한다.
            onChange={(event) => setContent(event.target.value)}
            // 간단한 스타일을 직접 추가할 수 있다.
            // 본격적으로 관리하려면 "className"을 지정한 후 css로 관리하는 편이 좋다.
            style={{ width: "80%" }}
            rows={24}
          />
        </dd>
      </dl>
      {/* 버튼으로부터 발생하는 이벤트를 바깥으로 위임한다. */}
      <button onClick={onCancel}>취소</button>
      <button onClick={() => onSave(title, content)}>저장</button>
      {post && <button onClick={onDelete}>삭제</button>}
    </div>
  );
}
