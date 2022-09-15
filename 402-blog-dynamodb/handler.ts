import * as storage from "./storage";

import { Post, PostListItem } from "./models";

import { APIGatewayProxyHandlerV2 } from "aws-lambda";

export const createPost: APIGatewayProxyHandlerV2 = async (event) => {
  // 요청 내용이 없다면 404 응답을 반환한다.
  if (!event.body) {
    return { statusCode: 404 };
  }
  // 요청이 올바르지 않을 경우 예외가 발생해 500 응답이 반환된다.
  // 필요하다면 이에 대한 유효성을 검증해 400 오류를 반환할 수 있다.
  const { title, content } = JSON.parse(event.body);
  const created = new Date().toISOString();

  // 만약 storage에 기록하지 못한다면 잘못된 요청이라는 뜻이므로 400을 반환한다.
  if (!(await storage.insert({ title, content, created }))) {
    return { statusCode: 400 };
  }
  // 보관한 글을 접근하기 위한 key인 title을 반환한다.
  return { title };
};

export const readPost: APIGatewayProxyHandlerV2<Post> = async (event) => {
  // 조회할 글에 대한 key가 전달되지 않았다면 404를 반환한다.
  if (!event.pathParameters || !event.pathParameters["title"]) {
    return { statusCode: 404 };
  }
  // storage로부터 글을 조회해서 반환한다. 만약 없다면 404를 반환한다.
  const post = await storage.select(event.pathParameters.title);
  if (!post) {
    return { statusCode: 404 };
  }
  return post;
};

export const updatePost: APIGatewayProxyHandlerV2 = async (event) => {
  // 수정할 글에 대한 key와 수정할 요청 내용이 없다면 404를 반환한다.
  if (!event.body || !event.pathParameters || !event.pathParameters["title"]) {
    return { statusCode: 404 };
  }
  // 수정할 글에 대한 key가 변경될 수 있으므로 oldTitle과 요청 내용의 title로 구분한다.
  const oldTitle = event.pathParameters.title;

  // 요청이 올바르지 않을 경우 예외가 발생해 500 응답이 반환된다.
  // 필요하다면 이에 대한 유효성을 검증해 400 오류를 반환할 수 있다.
  const { title, content } = JSON.parse(event.body);
  const modified = new Date().toISOString();

  // storage에 변경을 요청한다. 만약 수정할 글이 없거나 변경할 title의 글이 이미 존재한다면 400을 반환한다.
  if (!(await storage.update(oldTitle, { title, content, modified }))) {
    return { statusCode: 400 };
  }
  // 수정한 글에 접근할 수 있도록 key인 title을 반환한다.
  return { title };
};

export const deletePost: APIGatewayProxyHandlerV2 = async (event) => {
  // 삭제한 글에 대한 key가 없다면 404를 반환한다.
  if (!event.pathParameters || !event.pathParameters["title"]) {
    return { statusCode: 404 };
  }
  // 글을 삭제한다. 없는 글에 대한 삭제를 딱히 구분하지 않고 모두 성공으로 간주한다.
  await storage.remove(event.pathParameters.title);
  return { statusCode: 200 };
};

export const listPosts: APIGatewayProxyHandlerV2<
  PostListItem[]
> = async (/* event */) => {
  // storage에 보관하고 있는 글 목록을 반환한다.
  return storage.list();

  // 별도의 페이지 처리는 하지 않는다. 만약 필요할 경우 "event.queryStringParameters"으로 page와 size를
  // 받아서 다음과 같이 처리할 수 있다. 쿼리 파라미터가 없는 경우를 위해 기본 값을 설정해준다.
  // const page = +(event.queryStringParameters?.page ?? "0");
  // const size = +(event.queryStringParameters?.size ?? "30");
  // return storage.list(page, size);
};
