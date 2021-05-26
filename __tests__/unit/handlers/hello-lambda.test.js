const lambda = require('../../../src/handlers/hello-lambda.js');
let event, context;

describe('Test for hello-lambda', function () {
    it('Verifies successful response', async () => {
        const response = await lambda.handler(event, context);

        expect(response).toBeInstanceOf(Object);
        expect(response.statusCode).toEqual(200);
        expect(typeof response.body).toBe('string');

        const body = JSON.parse(response.body);

        expect(body).toBeInstanceOf(Object);
        expect(body.message).toEqual("Hello, World!");
        expect(typeof body.location).toBe('string');
    });
});
