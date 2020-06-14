import * as AWS from "aws-sdk";
import * as AWSXRAY from "aws-xray-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { TodoItem } from "../models/TodoItem";
import { TodoUpdate } from "../models/TodoUpdate";

const XAWS = AWSXRAY.captureAWS(AWS);

function createDynamoDBClient(): DocumentClient {
  if (process.env.IS_OFFLINE) {
    return new XAWS.DynamoDB.DocumentClient({
      region: "localhost",
      endpoint: "localstack:4569",
      sslEnabled: false,
    });
  }
  return new XAWS.DynamoDB.DocumentClient();
}

export class TodoAccessModel {
  public constructor(
    private readonly documentClient: DocumentClient = createDynamoDBClient(), //new AWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE
  ) {}

  public async all(userId: string): Promise<TodoItem[]> {
    const result = await this.documentClient
      .query({
        TableName: this.todosTable,
        IndexName: "UserIdIndex",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
        ScanIndexForward: false,
      })
      .promise();

    const items = result.Items;
    return items as TodoItem[];
  }

  public async get(todoId: string, userId: string): Promise<TodoItem> {
    const result = await this.documentClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: "todoId = :todoId and userId = :userId",
        ExpressionAttributeValues: {
          ":todoId": todoId,
          ":userId": userId,
        },
      })
      .promise();

    const item = result.Items[0];
    return item as TodoItem;
  }

  public async create(todoItem: TodoItem): Promise<TodoItem> {
    await this.documentClient
      .put({
        TableName: this.todosTable,
        Item: todoItem,
      })
      .promise();

    return todoItem;
  }

  public async update(
    todoId: string,
    createdAt: string,
    todoUpdate: TodoUpdate
  ): Promise<void> {
    this.documentClient
      .update({
        TableName: this.todosTable,
        Key: {
          todoId,
          createdAt,
        },
        UpdateExpression: "set #n = :name, done = :done, dueDate = :dueDate",
        ExpressionAttributeValues: {
          ":name": todoUpdate.name,
          ":done": todoUpdate.done,
          ":dueDate": todoUpdate.dueDate,
        },
        ExpressionAttributeNames: {
          "#n": "name",
        },
        ReturnValues: "UPDATED_NEW",
      })
      .promise();
  }

  public async setAttachmentUrl(
    todoId: string,
    userId: string,
    attachmentUrl: string
  ): Promise<void> {
    this.documentClient
      .update({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId,
        },
        UpdateExpression: "set attachmentUrl = :attachmentUrl",
        ExpressionAttributeValues: {
          ":attachmentUrl": attachmentUrl,
        },
        ReturnValues: "UPDATED_NEW",
      })
      .promise();
  }

  public async delete(todoId: string, userId: string): Promise<void> {
    this.documentClient
      .delete({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId,
        },
      })
      .promise();
  }
}
