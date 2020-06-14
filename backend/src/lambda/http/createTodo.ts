import "source-map-support/register";
import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import * as AWS from "aws-sdk";
import * as uuid from "uuid";
import { createLogger } from "../../utils/logger";
import { parseUserId } from "../../auth/utils";

const docClient = new AWS.DynamoDB.DocumentClient();

const todosTable = process.env.TODOS_TABLE;

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const logger = createLogger("CreateTodo");
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

// import 'source-map-support/register'

// import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

// import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
// import { getUserId } from '../utils'
// import { createLogger } from '../../utils/logger'
// import { createTodo } from '../../logicLayer/todo'
// const logger = createLogger('Todo')

// export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
//   const userId = getUserId(event);
//   logger.info('auth user id ', userId)
//   logger.info('Processing event: ', event);
//   const newTodo: CreateTodoRequest = JSON.parse(event.body);

//   // TODO: Implement creating a new TODO item

//   const todoItem = await createTodo(newTodo, userId)
//   return {
//     statusCode: 201,
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Credentials': true
//     },
//     body: JSON.stringify({item: todoItem})
//   }
// }
