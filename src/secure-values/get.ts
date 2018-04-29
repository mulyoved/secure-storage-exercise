import AWS = require('aws-sdk');
import {decrypt} from "./crypto";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const getValue = async (data: any) => {
  if (typeof data.id !== "string") {
    throw new Error("missing id");
  }

  if (typeof data.encryption_key !== "string") {
    throw new Error("missing encryption_key");
  }

  let answer: any = null;

  const TableName = process.env.DYNAMODB_TABLE;
  const ProjectionExpression = "id, encryptedValue";
  if (!data.id.endsWith("*")) {
    // optimize path for case we search for exact id
    const params = {
      TableName,
      Key: {
        id: data.id,
      },
      ProjectionExpression,
    };

    const result = await dynamoDb.get(params).promise();
    if (result.Item) {
      answer = [result.Item];
    } else {
      answer = [];
    }
  } else {
    // remove the * from the end
    const search = data.id.substring(0, data.id.length - 1);

    const params = {
      TableName,
      ExpressionAttributeValues: {
        ":search": search
      },
      FilterExpression: "begins_with(id, :search)",
      ProjectionExpression,
    };

    const result = await dynamoDb.scan(params).promise();
    answer = result.Items;

    if (result.LastEvaluatedKey) {
      throw new Error("Pagination is not yet implemented");
    }
  }

  const values = [];
  answer.forEach(({id, encryptedValue}) => {
    try {
      const value = decrypt(encryptedValue, data.encryption_key);
      values.push({id, value});
    } catch (err) {
      console.error(`Failed to decrypt ${id}`, err);
    }
  });

  return values;
};
