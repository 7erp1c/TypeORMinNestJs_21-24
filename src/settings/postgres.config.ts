import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import process from 'process';
import { appSettings } from './app-settings';

let postgres_Data_Base: string;

if (appSettings.env.isTesting()) {
  postgres_Data_Base = process.env.POSTGRES_DATABASE_TEST!;
} else if (appSettings.env.isDevelopment()) {
  postgres_Data_Base = process.env.POSTGRES_DATABASE!;
}

export const postgresConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: appSettings.api.POSTGRES_HOST,
  port: parseInt(<string>process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: postgres_Data_Base!,
  autoLoadEntities: true,
  synchronize: true,
  logging: true,
  //ssl: true,
};
