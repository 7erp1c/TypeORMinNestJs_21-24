import { Module } from '@nestjs/common';
import { TestingController } from './api/testing.controller';

@Module({
  imports: [],
  controllers: [TestingController],
  providers: [
    /*TestingService, TestingRepository, TestingRepositorySql*/
  ],
  exports: [],
})
export class TestingDeleteModule {}
