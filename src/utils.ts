export function callServerlessFunction(method: any, event: any, context: any, callback: any) {
  let data = event;
  if (event.body) {
    data = JSON.parse(event.body);
  }

  console.log("data:", JSON.stringify(data));

  method(data)
    .then((answer: any) => {
      console.log("answer:", JSON.stringify(answer));
      const response = {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*" // Required for CORS support to work
        },
        body: JSON.stringify(answer)
      };

      callback(null, response);
    })
    .catch((err: any) => {
      console.error("error:", JSON.stringify(err));
      callback(err);
    });
}