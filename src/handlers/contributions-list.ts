import { APIGatewayProxyResult } from 'aws-lambda';
import { searchTransactionsByQuery } from '../services/openaid-api.service';

/**
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Promise<APIGatewayProxyResult>} API Gateway Lambda Proxy Result Format.
 */
export const handler = async (): Promise<APIGatewayProxyResult> => {
  let response = null;

  try {
    const res = await searchTransactionsByQuery();

    response = {
      statusCode: 200,
      body: JSON.stringify(res),
    };
  } catch (err) {
    console.log(`Execution Error: ${err}`);

    response = {
      statusCode: 500,
      body: JSON.stringify({
        Error: err.message,
      }),
    };
  }

  return response;
};
