import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { UtilAllTest } from '../../util/fast.command/command.util';
import { InitAppSettingTest } from '../../util/fast.command/init.app.setting';
import { DataSource } from 'typeorm';

describe('Questions E2E', () => {
  let app;
  let httpServer;
  let initAppSettingTest: InitAppSettingTest;
  let utilIt: UtilAllTest;
  let connection: DataSource;
  beforeAll(async () => {
    initAppSettingTest = await new InitAppSettingTest();
    const { app: application, httpServer: server } =
      await initAppSettingTest.setup();
    app = application; // Assign app instance
    httpServer = server; // Assign httpServer instance
  });

  afterAll(async () => {
    await utilIt.clearDatabase(httpServer);
    await connection.destroy();
    await initAppSettingTest.teardown();
  });
  describe('plug', () => {
    it('test', () => {
      expect(true).toBe(true);
    });
  });

  it('/questions (POST) - should create a question', async () => {
    console.log('hello');
  });
});
