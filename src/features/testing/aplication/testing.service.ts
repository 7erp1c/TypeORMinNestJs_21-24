import { Injectable } from '@nestjs/common';
import { TestingRepository } from '../infrastructure/testing.repository';
import { TestingRepositorySql } from '../infrastructure.sql/testing.repository.sql';

@Injectable()
export class TestingService {
  constructor(
    private readonly testingRepository: TestingRepository,
    private readonly testingRepositorySql: TestingRepositorySql,
  ) {}

  async deleteAllData() {
    try {
      //this.testingRepository.dropDb();
      await this.testingRepositorySql.deleteAll();
      return;
    } catch {
      console.log('main method has failed, try additional method');
      await this.testingRepositorySql.deleteAll();
    }
  }
}
