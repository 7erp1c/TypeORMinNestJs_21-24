import { EntityManager } from 'typeorm';
import { TypeOrmEntity } from '../../../../base/typeorm/typeorm-entity';

export class TransactionsRepository {
  async save(
    entity: TypeOrmEntity,
    manager: EntityManager,
  ): Promise<TypeOrmEntity> {
    return manager.save(entity);
  }
}
