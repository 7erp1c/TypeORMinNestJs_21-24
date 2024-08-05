import { Module } from '@nestjs/common';
import { TestingController } from './api/testing.controller';
import { TestingService } from './aplication/testing.service';
import { TestingRepository } from './infrastructure/testing.repository';
import { TestingRepositorySql } from './infrastructure.sql/testing.repository.sql';

@Module({
  imports: [],
  controllers: [TestingController],
  providers: [TestingService, TestingRepository, TestingRepositorySql],
  exports: [],
})
export class TestingModule {}
