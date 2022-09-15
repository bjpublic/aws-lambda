import { APIGatewayEvent } from "aws-lambda";

export const handleConnect = async (event: APIGatewayEvent) => {
  return { statusCode: 200 };
};
