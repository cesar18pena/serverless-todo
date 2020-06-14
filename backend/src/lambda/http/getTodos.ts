import "source-map-support/register";
import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { getAllTodos } from "../../businessLogic/";
import { createLogger } from "../../utils/logger";

const getHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user

  const logger = createLogger("getAllTodos");
  logger.info("Event data:", event);

  const authHeader = event.headers.Authorization;
  const authSplit = authHeader.split(" ");
  const userId = authSplit[1];

  const items = await getAllTodos(userId);
  const result = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({
      items,
    }),
  };

  return result;
};

export const handler = middy(getHandler).use(cors({ credentials: true }));
