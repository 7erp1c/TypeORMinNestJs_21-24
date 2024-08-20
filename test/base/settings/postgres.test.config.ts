import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import process from 'process';

export const ormConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(<string>process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE_TEST,
  //entities: ['src/**/*.entity{.ts,.js}'],
  autoLoadEntities: true,
  synchronize: true,
  logging: true,
  //ssl: true,
};
