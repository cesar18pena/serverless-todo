import "source-map-support/register";
import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import * as AWS from "aws-sdk";
import * as Winstom from "../../utils/logger";
import { UpdateTodoRequest } from "../../requests/UpdateTodoRequest";

const docClient = new AWS.DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const logger = Winstom.createLogger("getAllTodos");
  logger.info("EVENT:", event);

  const todoId = event.pathParameters.todoId;
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);

  const todosTable = process.env.TODOS_TABLE;

  // DONE: Update a TODO item with the provided id using values in the "updatedTodo" object

  const updateTodoParams = {
    TableName: todosTable,
    Key: { todoId: todoId },
    UpdateExpression: "set #n = :a, dueDate = :b, done = :c",
    ExpressionAttributeValues: {
      ":a": updatedTodo["name"],
      ":b": updatedTodo.dueDate,
      ":c": updatedTodo.done,
    },
    ExpressionAttributeNames: {
      "#n": "name",
    },
    ReturnValues: "UPDATED_NEW",
  };

  const updatedTodoItem = await docClient.update(updateTodoParams).promise();

  return {
    statusCode: 201,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      updatedTodoItem,
    }),
  };
};
