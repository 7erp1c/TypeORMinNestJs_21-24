import request from 'supertest';

export class UtilAllTest {
  constructor() {}

  async clearDatabase(httpServer: any): Promise<void> {
    await request(httpServer).delete('/testing/all-data').expect(204);
  }
}
