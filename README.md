# Description

Service that exposes SET and GET endpoints to save and retrieve values while storing them securely. All data at rest
is securely encrypted with the key provided by the clients.

# Implementation Notes
- Service use AWS lambda functions fault tolerant and scalability
- Use AWS DynamoDb for storage
- Deployment is done using [serverless](https://serverless.com/)
- Language is TypeScript
- Unit tetsing using jest
- e2e testing using jest, as this is API product jest + axiom for rest API work well
- Encryption is done using node build-in crypto node-crypto-gcm with a small wrapper [crypto-gcm](https://www.npmjs.com/package/crypto-gcm)
GCM is rather popular authenticated encryption algorithm designed to provide both data authenticity (integrity) and confidentiality

# Usage

Encryption use node-crypto-gcm which need a fixed size key, to generate a key:

node
```
const key = crypto.randomBytes(32).toString("hex");
```

SET
```
curl \
-H "Content-Type: application/json" \
-X POST \
-d '{"id":"id-1","encryption_key":"920ec086a7f4cb35324444d655654b117a6f7f77519c123f4b5d0e4576bab524","value":"sample-string"}' \
https://iwiexmyvl1.execute-api.eu-west-2.amazonaws.com/dev/set
```

GET
```
curl \
-H "Content-Type: application/json" \
-X POST \
-d '{"id":"id-1","encryption_key":"920ec086a7f4cb35324444d655654b117a6f7f77519c123f4b5d0e4576bab524"}' \
https://iwiexmyvl1.execute-api.eu-west-2.amazonaws.com/dev/get
```

See ./e2e-tests/call-get-set.test.ts for more usage example


# Install

[Give AWS Credentials](https://serverless.com/framework/docs/providers/aws/guide/credentials/)

```
yarn test
yarn deploy
yarn e2e-test
```

# Limitations
- GET with a wildcard support only wildcard in the end of the id
- GET with wildcards use DynamoDB scan which scan the entire table,
in most use cases this should be efficient enough,
depending on the usage pattern maybe need to consider using SQL database or
organize DynamoDB keys differently

# Todo/To Improve
- Documentation, browser examples if needed
- Implement delete API, this will help to write more complete testing so can clean the database before running the test, right now after initial run values are just updated and not created
- Set a fixed URL so in case the service need to be removed and
deploy again or deploy in a different region end point url stay the same
- Connect to centralized logging like splunk
- Connect to centralized errors reports like sentry
- AWS API pagination for large get results, currently will return error if result size exceed AWS limits

# Hints

## Project created using

```sh
serverless create --template aws-nodejs-typescript --path secure-storage-exercise
cd secure-storage-exercise
yarn install
```

## Query DynamoDB from the terminal

### find 1 item
```
aws dynamodb scan \
     --region eu-west-2 \
     --profile secure-storage-exercise \
     --table-name aws-nodejs-typescript-dev \
     --filter-expression "id = :search" \
     --expression-attribute-values '{":search":{"S":"s1"}}'
```

### scan
```
aws dynamodb scan \
     --region eu-west-2 \
     --profile secure-storage-exercise \
     --table-name aws-nodejs-typescript-dev \
     --filter-expression "begins_with(id, :search)" \
     --expression-attribute-values '{":search":{"S":"s"}}'
```

## get serverless functions logs

```
sls logs -f set
sls logs -f get
```

## browser the records on AWS

[aws-nodejs-typescript-dev
](https://eu-west-2.console.aws.amazon.com/dynamodb/home?region=eu-west-2)