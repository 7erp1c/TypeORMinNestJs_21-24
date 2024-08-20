import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

export class SaveRepository {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}
  async save<T>(entity: T) {
    try {
      return this.entityManager.save(entity);
    } catch (e) {
      throw e;
    }
  }
}
