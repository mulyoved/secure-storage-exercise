import AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.list = (event, context, callback) => {
  const data = JSON.parse(event.body);
  if (typeof data.id !== "string") {
    console.error("Validation Failed");
    callback(new Error("Couldn't search todo item."));
    return;
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    ExpressionAttributeValues: {
      ":search": data.id
    },
    FilterExpression: "begins_with(id, :search)",
    ProjectionExpression: "id",
  };

  dynamoDb.scan(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(new Error("Couldn't search todo item."));
      return;
    }

    console.log("Scan params", params);
    console.log("Scan result", result);

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Items)
    };
    callback(null, response);
  });
};
