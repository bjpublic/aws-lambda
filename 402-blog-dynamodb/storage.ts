import { Post, PostListItem } from "./models";

import { DynamoDB } from "aws-sdk";
import { TableName } from "./env";
import { deepEqual } from "fast-equals";

// DynamoDB에 보관하는 문서 내 각 필드의 type을 직접 명시하지 않기 위해
// 보다 간편하게 사용할 수 있는 DocumentClient를 사용한다.
const db = !process.env.IS_OFFLINE
  ? new DynamoDB.DocumentClient()
  : new DynamoDB.DocumentClient({
      region: "localhost",
      endpoint: "http://localhost:8000",
    });

export async function insert(post: Post): Promise<boolean> {
  try {
    // DynamoDB에 새 글을 추가한다.
    await createItem(post);
  } catch (error: any) {
    // 만약 동일한 title이 이미 존재해서 "ConditionalCheckFailedException" 오류가 발생했거나
    // 혹은 일시적인 문제로 인해 오류가 발생한 경우에는 간단히 삽입 실패로 간주한다.
    // 발생할 수 있는 전체 에러는 다음 페이지에서 확인할 수 있다.
    // https://docs.aws.amazon.com/ko_kr/amazondynamodb/latest/developerguide/Programming.Errors.html
    if (error.code === "ConditionalCheckFailedException" || error.retryable) {
      return false;
    }
    // 그 외의 경우에는 예외를 그대로 던져서 요청이 서버 에러로 실패하도록 한다.
    throw error;
  }

  // 새 글을 추가했으므로 글 목록에 새로 등록한 글을 추가한다.
  await modifyPostEntries((entries) =>
    entries.concat({ title: post.title, created: post.created })
  );
  return true;
}

export async function select(title: string): Promise<Post | null> {
  // title을 key로 해서 DynamoDB로부터 글을 조회한다.
  // 만약 글이 존재하지 않는다면 null을 반환한다.
  const postData = await db.get({ TableName, Key: { title } }).promise();
  return (postData.Item as Post) ?? null;
}

export async function update(
  oldTitle: string,
  post: Omit<Post, "created">
): Promise<boolean> {
  if (oldTitle === post.title) {
    // 만약 key가 변경되지 않았다면 글 내용을 직접 수정한다.
    // 이는 동시 수정 시 충돌 여부를 알 수 없지만 원하는 값만 바로 수정할 수 있어 비용이 저렴하다.
    await db
      .update({
        TableName,
        // 갱신할 대상의 key를 지정한다. 단순히 title을 넣는게 아니라 "{ title }"과 같이 객체를 넣는다.
        Key: { title: post.title },
        // 갱신할 대상에 대한 수정 표현 식을 넣는다.
        // 만약 필드 이름이 예약어에 속한다면 "ExpressionAttributeNames"을 사용한다.
        // 예약어 전체 목록은 다음에서 확인할 수 있다.
        // https://docs.aws.amazon.com/ko_kr/amazondynamodb/latest/developerguide/ReservedWords.html
        UpdateExpression: "SET content = :content, modified = :modified",
        // 수정 표현식에 대입할 값을 지정한다. 글 내용과 수정 일자를 갱신한다.
        ExpressionAttributeValues: {
          ":content": post.content,
          ":modified": post.modified!,
        },
      })
      .promise();
    // 글 목록은 title과 created만 관리하는데 여기서는 아무것도 수정하지 않았으므로
    // 따로 갱신할 필요가 없다.
  } else {
    // title이 변경되었다면 과거 글을 삭제하고 새로 글을 등록해야 한다.
    // 만약 과거 글이 없다면 잘못된 수정 요청이므로 실패 처리한다.
    const oldPost = await select(oldTitle);
    if (oldPost === null) {
      return false;
    }
    // 만약 새로 사용할 title에 해당하는 글이 이미 존재한다면 실패 처리한다.
    const maybeNewExisting = await select(post.title);
    if (maybeNewExisting !== null) {
      return false;
    }

    // 과거 글은 지우고 새 글을 등록한다. 두 작업은 트랜잭션으로 한 번에 처리한다.
    // created와 같이 수정 요청에는 포함되지 않는 필드를 보존하기 위해 새 글은 과거 글에 변경분을 합쳐서 사용한다.
    const newPost = { ...oldPost, ...post };
    try {
      await db
        .transactWrite({
          TransactItems: [
            {
              Delete: {
                TableName,
                Key: { title: oldTitle },
                ConditionExpression: "attribute_exists(title)",
              },
            },
            {
              Put: {
                TableName,
                Item: newPost,
                ConditionExpression: "attribute_not_exists(title)",
              },
            },
          ],
        })
        .promise();
    } catch (error: any) {
      // 만약 동시 수정이 발생해서 조건 위반이 발생하거나, 혹은 일시적인 오류가 발생한 경우에는 이를 클라이언트 오류로
      // 취급할 수 있도록 false를 반환한다.
      if (error.code === "ConditionalCheckFailedException" || error.retryable) {
        return false;
      }
    }

    // 글 목록에서 과거 글을 제거하고 새 글을 추가한다.
    // 이는 별도의 버전 관리를 통해 재시도가 필요할 수 있으므로 트랜잭션에서 제외한다.
    await modifyPostEntries((entries) =>
      entries
        .filter((entry) => entry.title !== oldTitle)
        .concat({ title: newPost.title, created: newPost.created })
    );
  }
  return true;
}

export async function remove(title: string): Promise<void> {
  // DynamoDB에서 글을 삭제하고,
  await db.delete({ TableName, Key: { title } }).promise();

  // 글 목록에서도 제거합니다.
  await modifyPostEntries((entries) =>
    entries.filter((entry) => entry.title !== title)
  );
}

export async function list(): Promise<PostListItem[]> {
  // 글 목록 객체 내에서 관리하는 목록 대상을 반환한다.
  return (await fetchPosts()).entries;
}

async function createItem<T>(item: T): Promise<void> {
  // "attribute_not_exists" 조건을 사용하여 key인 title이 존재하지 않을 때만
  // 값을 추가put 할 수 있도록 DynamoDB에 요청한다.
  await db
    .put({
      TableName,
      Item: item,
      // 다른 표현식에 대해서는 다음 링크를 참고한다.
      // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html
      ConditionExpression: "attribute_not_exists(title)",
    })
    .promise();
}

async function updateItem<T extends { version: number }>(
  item: T
): Promise<void> {
  // 갱신하려는 대상이 지정된 "version" 값일 때만 갱신한다.
  await db
    .put({
      TableName,
      Item: item,
      // 이 때, DynamoDB 내의 값은 이전 "version" 값을 가지고 있어야 한다.
      // 따라서 갱신하려는 순간 다른 요청에 의해 이 값이 변경되었다면 재시도 해야 한다.
      // 그리고 재시도 할 때 발생하는 요청은 순서에 의한 영향을 받지 않아야 문제가 없다.
      ConditionExpression: "version = :version",
      ExpressionAttributeValues: { ":version": item.version - 1 },
    })
    .promise();
}

// 글 목록도 글을 보관하는 테이블에 함께 보관한다.
// 적당히 글 제목으로 사용하지 않을 것 같은 title을 key로 사용한다.
// 보통은 별도의 테이블에 기록하는게 맞지만 예제의 양을 줄이기 위해 이렇게 사용한다.
const listTitle = "$_";

// 글 목록을 보관할 자료 구조를 정의한다.
interface Posts {
  // key에 해당하는 title은 반드시 "listTitle" 값을 갖는다.
  title: typeof listTitle;
  // 간단한 충돌 해소를 위한 "version" 값을 갖는다.
  version: number;
  // 글 목록을 보관할 배열이다.
  entries: PostListItem[];
}

async function fetchPosts(): Promise<Posts> {
  // DynamoDB에 보관 중인 글 목록을 조회한다.
  const postsObject = await db
    .get({ TableName, Key: { title: listTitle } })
    .promise();
  // 만약 존재하지 않는다면 빈 목록을 반환한다.
  return (
    (postsObject.Item as Posts) ?? { title: listTitle, version: 0, entries: [] }
  );
}

// 글 목록 갱신 도중 발생하는 충돌 해소는 최대 10번까지 수행한다.
const maxRetryCount = 10;

async function modifyPostEntries(
  modify: (entries: PostListItem[]) => PostListItem[]
): Promise<void> {
  // 충돌이 발생할 것을 가정하고, 지정된 횟수 동안 재시도한다.
  for (let i = 0; i < maxRetryCount; ++i) {
    // 이전 글 목록을 불러온다.
    const posts = await fetchPosts();

    // 지정된 수정을 통해 글 목록을 갱신한다.
    const entries = modify(posts.entries).sort((a, b) =>
      b.created.localeCompare(a.created)
    );
    try {
      // 만약 DynamoDB 내의 글 목록과 새로 갱신할 대상이 달라졌다면 DynamoDB에 반영해야 한다.
      if (!deepEqual(posts.entries, entries)) {
        // 반영을 위핸 객체를 준비한다. 이전 글 목록에 변경된 "entries"를 넣는다.
        const newPosts = { ...posts, version: posts.version + 1, entries };
        if (posts.version === 0) {
          // 만약 기존 "version"이 0이었다면 아직 DynamoDB에 값이 없다는 뜻이므로 값을 새로 추가한다.
          await createItem(newPosts);
        } else {
          // 그렇지 않다면 그 "version" 값으로부터 "+1 한 version" 값을 갖도록 갱신해본다.
          await updateItem(newPosts);
        }
      }
      // 글 목록의 생성 혹은 갱신이 잘 수행되었다면 재시도 없이 요청을 완료한다.
      return;
    } catch (error: any) {
      // "version" 값 불일치로 인해 "ConditionalCheckFailedException" 오류가 발생했거나
      // 혹은 일시적 장애에 의한 오류가 발생한 경우 재시도한다.
      // 단, 일시적 장애의 경우 해당 문제가 즉시 해결되지 않을 수도 있으므로 약간의 sleep을 주는 것이 좋지만
      // 여기서는 처리하지 않는다.
      if (error.code === "ConditionalCheckFailedException" || error.retryable) {
        continue;
      }
      // 그 외의 경우라면 재시도해도 문제를 해결할 수 없으니 요청 실패를 위해 예외를 던진다.
      // 이 때 이미 글은 변경된 상태이고 목록만 갱신하지 못했기 때문에 데이터의 정합성이 깨진 상태이다.
      throw error;
    }
  }
  // 지정된 횟수까지 재시도 했는데 여전히 충돌이 발생한다면 오류를 발생한다.
  // 이 때 이미 글은 변경된 상태이고 목록만 갱신하지 못했기 때문에 데이터의 정합성이 깨진 상태이다.
  throw new Error("글 목록 수정이 실패했습니다");
}
