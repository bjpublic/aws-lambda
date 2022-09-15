import { APIGatewayProxyHandlerV2 } from "aws-lambda";

export const hello: APIGatewayProxyHandlerV2 = async (event) => {
  if (!event.queryStringParameters || !event.queryStringParameters.name) {
    return { statusCode: 404, body: `Not Found` };
  }
  const message = `Hello, ${event.queryStringParameters.name}!`;
  console.info(message);
  return { statusCode: 200, body: message };
};
