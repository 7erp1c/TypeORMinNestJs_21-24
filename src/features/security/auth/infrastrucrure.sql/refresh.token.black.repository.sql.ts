import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { BlackList } from '../domain/refresh.token.black.list.entity';

@Injectable()
export class RefreshTokenBlackRepositorySql {
  constructor(
    @InjectDataSource()
    protected dataSource: DataSource,
    @InjectRepository(BlackList)
    private readonly tokenRepository: Repository<BlackList>,
  ) {}

  async addToBlackList(oldToken: string) {
    try {
      await this.dataSource.query(
        ` INSERT INTO "BlackList"
             ("oldToken")
              values($1)`,
        [oldToken],
      );
      return true;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findInBlackList(oldToken: string) {
    try {
      console.log('oldToken', oldToken);
      const isInBlackList = await this.dataSource.query(
        `SELECT "oldToken" FROM public."BlackList" 
                   WHERE "oldToken" = $1;`,
        [oldToken],
      );
      return isInBlackList[0] ? isInBlackList[0] : null;
    } catch (error) {
      throw new Error(error);
    }
  }
}
