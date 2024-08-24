import { Controller, Delete, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TestingService } from '../aplication/testing.service';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@ApiTags('Testing')
@Controller('testing')
export class TestingController {
  constructor(
    protected testingService: TestingService,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  @Delete('all-data')
  @HttpCode(204)
  async deleteAll(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      // Отключаем проверки внешних ключей
      await queryRunner.query('SET CONSTRAINTS ALL DEFERRED;');

      // Удаляем данные из зависимых таблиц сначала
      await queryRunner.query('DELETE FROM "CommentsLikes";');
      await queryRunner.query('DELETE FROM "Comments";');
      await queryRunner.query('DELETE FROM "PostsLikes";');
      await queryRunner.query('DELETE FROM "Posts";');
      await queryRunner.query('DELETE FROM "questions_games_games";');
      await queryRunner.query('DELETE FROM "answers";');
      await queryRunner.query('DELETE FROM "players";');
      await queryRunner.query('DELETE FROM "questions";');
      await queryRunner.query('DELETE FROM "games";');
      await queryRunner.query('DELETE FROM "Blogs";');
      await queryRunner.query('DELETE FROM "Sessions";');
      await queryRunner.query('DELETE FROM "BlackList";');
      await queryRunner.query('DELETE FROM "Users";');

      // Включаем проверки внешних ключей обратно
      await queryRunner.query('SET CONSTRAINTS ALL IMMEDIATE;');

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}

// @Delete('/all-data')
// @HttpCode(HttpStatus.NO_CONTENT)
// async deleteAllData() {
//   await this.testingService.deleteAllData();
//   return;
// }
//Каскадное удаление шоб ключи не ругались на неопнятные связи😁
// @Delete('/all-data')
// @HttpCode(204)
// async clearBd(): Promise<void> {
//   await this.dataSource.query(`DELETE FROM public."BlackList" CASCADE`);
//   await this.dataSource.query(`DELETE FROM public."Sessions" CASCADE`);
//   await this.dataSource.query(`DELETE FROM public."Users" CASCADE`);
//   await this.dataSource.query(`DELETE  FROM public."CommentsLikes" CASCADE`);
//   await this.dataSource.query(`DELETE  FROM public."Comments" CASCADE`);
//   await this.dataSource.query(`DELETE FROM public."PostsLikes" CASCADE`);
//   await this.dataSource.query(`DELETE  FROM public."Posts" CASCADE`);
//   await this.dataSource.query(`DELETE FROM public."Blogs" CASCADE`);
//
//   return;
// }

// @Delete('/all-data')
// @HttpCode(204)
// async clearBd(): Promise<void> {
//   await this.dataSource.transaction(async (transactionalEntityManager) => {
//     const entities = [
//       'answers',
//       'players',
//       'questions_games_games',
//       'questions',
//       'games',
//       'BlackList',
//       'Session',
//       'Users',
//       'CommentsLikes',
//       'Comments',
//       'PostsLikes',
//       'Posts',
//       'Blogs',
//     ];
//     for (const entity of entities) {
//       const repository = transactionalEntityManager.getRepository(entity);
//       const records = await repository.find();
//       for (const record of records) {
//         await repository.remove(record);
//       }
//     }
//   });
// const entities = [
//   'answers',
//   'players',
//   'questions_games_games',
//   'questions',
//   'games',
//   'BlackList',
//   'Session',
//   'Users',
//   'CommentsLikes',
//   'Comments',
//   'PostsLikes',
//   'Posts',
//   'Blogs',
// ];
// for (const entity of entities) {
//   const repository = this.dataSource.getRepository(entity);
//   const records = await repository.find();
//
//   for (const record of records) {
//     await repository.remove(record);
//   }
// }

//   for (const entity of entities) {
//     await this.dataSource.getRepository(entity).clear();
//   }
//
//   return;
