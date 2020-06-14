import "source-map-support/register";
import * as middy from "middy";
import { cors } from "middy/middlewares";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import { CreateTodoRequest } from "../../requests/CreateTodoRequest";
import { createTodo } from "../../businessLogic/";
import { createLogger } from "../../utils/logger";

const createHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // TODO: Implement creating a new TODO item

  const logger = createLogger("CreateTodo");
  logger.info("Event data:", event);

  const newTodo: CreateTodoRequest = JSON.parse(event.body);
  const authorization = event.headers.Authorization;
  const split = authorization.split(" ");
  const jwtToken = split[1];

  const newItem = await createTodo(newTodo, jwtToken);
  return {
    statusCode: 201,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({
      newItem,
    }),
  };
};

export const handler = middy(createHandler).use(cors({ credentials: true }));
