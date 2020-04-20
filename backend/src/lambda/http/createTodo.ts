import "source-map-support/register";
import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import * as AWS from "aws-sdk";
import * as uuid from "uuid";
import * as Winstom from "../../utils/logger";
import { parseUserId } from "../../auth/utils";

const docClient = new AWS.DynamoDB.DocumentClient();

const todosTable = process.env.TODOS_TABLE;

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const logger = Winstom.createLogger("CreateTodo");
  logger.info("Event data:", event);

  const todoId = uuid.v4();
  const jsonBody = JSON.parse(event.body);

  const authHeader = event.headers.Authorization;
  const authSplit = authHeader.split(" ");
  const token = authSplit[1];

  const item = {
    todoId: todoId,
    userId: parseUserId(token),
    ...jsonBody,
  };

  await docClient
    .put({
      TableName: todosTable,
      Item: item,
    })
    .promise();

  return {
    statusCode: 201,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      item,
    }),
  };
};
