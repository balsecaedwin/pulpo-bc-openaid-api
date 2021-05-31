import { handler } from '../../../src/handlers/contributions-list';

describe('Test for contributions-list', () => {
  it('Verifies successful response', async () => {
    const response = await handler();

    expect(response).toBeInstanceOf(Object);
    expect(response.statusCode).toEqual(200);
    expect(typeof response.body).toBe('string');

    const body = JSON.parse(response.body);

    expect(body).toBeInstanceOf(Object);
  });
});
