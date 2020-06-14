import "source-map-support/register";
import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import { getAllTodos } from "../../businessLogic/";
import { createLogger } from "../../utils/logger";
import { parseUserId } from "../../auth/utils";

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user

  const logger = createLogger("getAllTodos");
  logger.info("Event data:", event);

  const authHeader = event.headers.Authorization;
  const authSplit = authHeader.split(" ");
  const userId = parseUserId(authSplit[1]);

  const items = await getAllTodos(userId);

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      items,
    }),
  };
};
