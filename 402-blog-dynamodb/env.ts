// DynamoDB의 경우 "serverless.ts"에서 자원을 선언할 때 테이블을 함께 선언하고
// 이후 "storage.ts"에서 테이블에 접근할 때도 테이블 이름을 사용한다.
// 때문에 두 곳에서 동일한 테이블 이름을 사용할 수 있도록 별도의 파일로 분리한다.
export const TableName = "post";
