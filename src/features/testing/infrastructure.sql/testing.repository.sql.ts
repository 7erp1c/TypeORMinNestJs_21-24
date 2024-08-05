import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { appSettings } from '../../../settings/app-settings';
import mongoose from 'mongoose';
@Injectable()
export class TestingRepositorySql {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async dropMongoDb() {
    try {
      const db = appSettings.api.MONGO_CONNECTION_URI;
      const conn = mongoose.createConnection(db); // Connecting to the database.
      await conn.dropDatabase();
    } catch {
      console.log('DB dropping does failed');
      throw new Error('DB dropping did fail');
    }
  }

  async deleteAll() {
    const tables = await this.dataSource.query(
      `SELECT "table_name" FROM information_schema.tables  where table_schema='public'`,
    );
    const deleteAllQuery = tables
      .map((table: any) => {
        return `DELETE FROM "${table.table_name}"`;
      })
      .join(';');
    await this.dataSource.query(deleteAllQuery);
    //await this.dropMongoDb();
  }
}
