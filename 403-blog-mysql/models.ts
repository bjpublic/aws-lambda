// Storage에 보관할 글에 대한 모델을 정의한다.
export interface Post {
  title: string; // 글 제목이자 key.
  content: string; // 글 내용.
  created: string; // 생성 일시.
  modified?: string; // 수정 일시. 수정이 없다면 값이 없다.
}

// 글 목록에 노출할 필드를 가지는 모델을 정의한다.
export interface PostListItem {
  title: string; // 글 제목이자 key.
  created: string; // 생성 일시.
}
