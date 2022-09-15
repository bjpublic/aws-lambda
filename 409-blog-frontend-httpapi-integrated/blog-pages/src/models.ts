// 글 목록 모델. 글 목록 조회 API 응답에서 사용한다.
export interface PostListItem {
  title: string;
  created: string;
}

// 글 모델. 글 조회 API의 응답에서 사용한다.
export interface Post {
  title: string;
  content: string;
  created: string;
  modified?: string;
}
