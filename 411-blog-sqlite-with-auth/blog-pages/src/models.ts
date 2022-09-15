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

// 권한 모델. 인증 정보로부터 획득한 권한 여부를 확인하기 위해, 허가 API의 응답에서 사용한다.
export interface Grant {
  email: string | null;
  admin: boolean;
}
