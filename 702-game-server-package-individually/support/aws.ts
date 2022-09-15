import { ApiGatewayManagementApi, Lambda } from "aws-sdk";

export const managementApi = new ApiGatewayManagementApi({
  endpoint: process.env.IS_OFFLINE
    ? "http://localhost:3001"
    : process.env.MANAGEMENT_API_URL!,
});

export const lambda = new Lambda({
  endpoint: process.env.IS_OFFLINE ? `http://localhost:3002` : undefined,
});
