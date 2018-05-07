import AWS = require("aws-sdk");
import { decrypt } from "./crypto";

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TableName = process.env.DYNAMODB_TABLE;
const ProjectionExpression = "id, encryptedValue";

const getOneDBValue = async (id: string) => {
  const params = {
    TableName,
    Key: {
      id
    },
    ProjectionExpression
  };

  try {
    const result = await dynamoDb.get(params).promise();
    if (result.Item) {
      return result.Item;
    } else {
      return undefined;
    }
  } catch (err) {
    throw new Error(`DynamoDB error ${err.message}`);
  }
};

const getManyDBValue = async (search: string) => {
  const params = {
    TableName,
    ExpressionAttributeValues: {
      ":search": search
    },
    FilterExpression: "begins_with(id, :search)",
    ProjectionExpression
  };

  let result;
  try {
    result = await dynamoDb.scan(params).promise();
  } catch (err) {
    throw new Error(`DynamoDB error ${err.message}`);
  }


  if (result.LastEvaluatedKey) {
    throw new Error("Pagination is not yet implemented");
  }

  return result.Items;
};

const getDBValues = async (id: string) => {
  let answer = [];
  if (id.substring(id.length - 1) === "*") {
    const item = await getOneDBValue(id);
    if (item) {
      answer = [item];
    } else {
      answer = [];
    }
  } else {
    // remove the * from the end
    const search = id.substring(0, id.length - 1);
    answer = await getManyDBValue(search);
  }

  return answer;
};

export const getValue = async (data: any) => {
  if (typeof data.id !== "string") {
    throw new Error("missing id");
  }

  if (typeof data.encryption_key !== "string") {
    throw new Error("missing encryption_key");
  }

  let answer: any[] = await getDBValues(data.id);

  const values = [];
  answer.forEach(({ id, encryptedValue }) => {
    try {
      const value = decrypt(encryptedValue, data.encryption_key);
      values.push({ id, value });
    } catch (err) {
      console.error(`Failed to decrypt ${id}`, err);
    }
  });

  return values;
};
