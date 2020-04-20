import "source-map-support/register";
import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import { createLogger } from "../../utils/logger";
import * as AWS from "aws-sdk";
import * as uuid from "uuid";

const docClient = new AWS.DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const logger = createLogger("Generate Upload URL");
  logger.info("Event data", event);

  const todoId = event.pathParameters.todoId;
  const imageId = uuid.v4();

  const bucket = process.env.S3_BUCKET;
  const urlExperationTime = process.env.SIGNED_URL_EXPIRATION;
  const todosTable = process.env.TODOS_TABLE;

  const s3 = new AWS.S3({
    signatureVersion: "v4",
  });

  // DONE: Return a presigned URL to upload a file for a TODO item with the provided id
  const url = s3.getSignedUrl("putObject", {
    Bucket: bucket,
    Key: imageId,
    Expires: urlExperationTime,
  });

  const imageUrl = `https://${bucket}.s3.amazonaws.com/${imageId}`;

  const updateUrlOnTodo = {
    TableName: todosTable,
    Key: { todoId: todoId },
    UpdateExpression: "set attachmentUrl = :a",
    ExpressionAttributeValues: {
      ":a": imageUrl,
    },
    ReturnValues: "UPDATED_NEW",
  };

  await docClient.update(updateUrlOnTodo).promise();

  return {
    statusCode: 201,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      iamgeUrl: imageUrl,
      uploadUrl: url,
    }),
  };
};
