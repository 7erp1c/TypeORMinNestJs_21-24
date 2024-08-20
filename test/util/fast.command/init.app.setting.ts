import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '../../../src/app.module';
import { ormConfig } from '../../base/settings/postgres.test.config';
import { DataSource } from 'typeorm';

export class InitAppSettingTest {
  protected app: INestApplication;

  async setup() {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TypeOrmModule.forRoot(ormConfig)],
    }).compile();

    this.app = moduleFixture.createNestApplication();
    const connection = this.app.get(DataSource);
    await this.app.init();
    const httpServer = this.app.getHttpServer();
    return {
      connection,
      app: this.app,
      httpServer,
    };
  }

  async teardown() {
    try {
      await this.app.close();
    } catch (error) {
      console.error('Error during teardown:', error);
    }
  }
}
