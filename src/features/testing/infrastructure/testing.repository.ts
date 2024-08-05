import { Injectable } from '@nestjs/common';
import { appSettings } from '../../../settings/app-settings';
import mongoose from 'mongoose';

@Injectable()
export class TestingRepository {
  constructor() {}
  async dropDb() {
    try {
      let db: any;
      if (appSettings.env.isProduction())
        throw new Error('we need the rights of the creator');
      if (appSettings.env.isTesting()) {
        db = appSettings.api.MONGO_CONNECTION_URI_FOR_TESTS;
      }
      if (appSettings.env.isDevelopment()) {
        db = appSettings.api.MONGO_CONNECTION_URI;
      }
      if (db) {
        await mongoose.connect(db); // Connecting to the database.
        await mongoose.connection.db.dropDatabase();
      }
    } catch {
      console.log('DB dropping does failed');
      throw new Error('DB dropping did fail');
    }
  }

  async deleteAll() {
    await this.dropDb();
  }
}
