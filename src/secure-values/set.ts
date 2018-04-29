import AWS = require('aws-sdk');
import {encrypt} from "./crypto";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const setValue = async (data: any) => {
  if (typeof data.id !== "string") {
    throw new Error("missing id");
  }

  if (typeof data.encryption_key !== "string") {
    throw new Error("missing encryption_key");
  }

  const encryptedValue = encrypt(data.value, data.encryption_key);

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      id: data.id,
      encryptedValue,
    }
  };

  await dynamoDb.put(params).promise();
};
