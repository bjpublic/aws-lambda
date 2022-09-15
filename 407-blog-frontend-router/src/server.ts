import { Post, PostListItem } from "./models";

// 글 목록 조회 API를 요청하는 함수.
export async function fetchPostListItems(): Promise<PostListItem[]> {
  return (
    fetch(`${process.env.REACT_APP_SERVER}/api/post`)
      // 응답 결과를 JSON으로 변환해서 반환한다. any 타입이 반환형에 맞게 인식된다.
      .then((r) => r.json())
  );
}

// 글 조회 API를 요청하는 함수.
export async function fetchPost(title: string): Promise<Post> {
  // 주소에 들어가는 값은 따로 "encodeURIComponent"를 해주지 않아도 인코딩된다.
  return fetch(`${process.env.REACT_APP_SERVER}/api/post/${title}`).then((r) =>
    r.json()
  );
}

// 글 생성 API를 요청하는 함수.
export async function createPost(
  title: string,
  content: string
): Promise<{ title: string }> {
  return fetch(`${process.env.REACT_APP_SERVER}/api/post`, {
    method: "POST",
    // 요청할 때 Content-Type을 명시해야 한다.
    headers: { "Content-Type": "application/json" },
    // JSON 객체를 JSON 문자열로 변환해서 요청해야 한다.
    body: JSON.stringify({ title, content }),
  }).then((r) => r.json());
}

// 글 수정을 요청하는 함수.
export async function updatePost(
  oldTitle: string,
  title: string,
  content: string
): Promise<{ title: string }> {
  // 글 생성 API에 대한 요청과 거의 동일하지만, 주소에 예전 글 제목이 들어간다.
  return fetch(`${process.env.REACT_APP_SERVER}/api/post/${oldTitle}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  }).then((r) => r.json());
}

// 글 삭제를 요청하는 함수.
export async function deletePost(title: string): Promise<void> {
  const response = await fetch(
    `${process.env.REACT_APP_SERVER}/api/post/${title}`,
    { method: "DELETE" }
  );
  // 글 삭제 API는 응답 본문이 없기 때문에 상태 코드만 확인한다.
  if (!response.ok) {
    throw new Error(`글을 삭제할 수 없습니다. 제목[${title}]`);
  }
}
