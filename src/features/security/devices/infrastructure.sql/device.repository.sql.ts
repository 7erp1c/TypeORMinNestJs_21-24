import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import {
  SessionModel,
  SessionUpdateModel,
} from '../api/model/input/session.input.models';
import { Session } from '../domain/device.entity.type.orm';

@Injectable()
export class DeviceRepositorySql {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Session)
    private readonly repository: Repository<Session>,
  ) {}

  async createNewSession(sessionModel: SessionModel) {
    try {
      const session = await this.repository
        .createQueryBuilder()
        .insert()
        .into(Session)
        .values({
          userId: sessionModel.userId,
          deviceId: sessionModel.deviceId,
          deviceTitle: sessionModel.deviceTitle,
          ip: sessionModel.ip,
          lastActiveDate: sessionModel.lastActiveDate,
          createdAt: sessionModel.refreshToken.createdAt,
          expiredAt: sessionModel.refreshToken.expiredAt,
        });
      console.log('Query:', session.getSql());
      const result = await session.execute();
      return result;
    } catch (error) {
      console.error('An error occurred while creating a new session:', error);
      throw new Error('Failed to create a new session');
    }
  }

  async deleteSessionsExpectCurrent(userId: string, deviceId: string) {
    try {
      // Проверяем, есть ли сессии для удаления
      const sessions = await this.dataSource.query(
        `SELECT * FROM public."Sessions"
       WHERE "userId" = \$1 AND "deviceId" <> \$2 AND "isDeleted" = false`,
        [userId, deviceId],
      );
      if (sessions.length <= 0)
        throw new NotFoundException('Session not found');
      const isDelete = await this.repository
        .createQueryBuilder()
        .update()
        .set({ isDeleted: true })
        .where('deviceId <> :deviceId', { deviceId })
        .andWhere('userId = :userId', { userId });

      console.log('Query:', isDelete.getSql());
      const result = await isDelete.execute();
      if (result.affected === 0) {
        throw new NotFoundException('Session not found');
      } else {
        return true;
      }
      // await this.dataSource.query(
      //   `DELETE FROM public."Sessions"
      // WHERE "userId" = $1 AND "deviceId" <> $2;`,
      //   [userId, deviceId],
      // );
    } catch (error) {
      throw new Error(error);
    }
  }

  async deleteSessionById(deviceId: string, userId: string) {
    try {
      const isDelete = await this.repository
        .createQueryBuilder()
        .update()
        .set({ isDeleted: true })
        .where('deviceId = :deviceId', { deviceId })
        .andWhere('userId = :userId', { userId });

      console.log('Query:', isDelete.getSql());
      const result = await isDelete.execute();
      if (result.affected === 0) {
        throw new NotFoundException('Session not found');
      } else {
        return true;
      }
    } catch {
      throw new NotFoundException('Session not found');
    }
  }

  async getSessionByDeviceId(deviceId: string) {
    try {
      const session = await this.dataSource.query(
        `SELECT * FROM "Sessions" 
               WHERE "deviceId" = $1
               AND "isDeleted" = false`,
        [deviceId],
      );
      //if (!session) throw new NotFoundException('Session not found');
      return session[0];
    } catch {
      throw new NotFoundException('Session not found');
    }
  }

  async updateExistSession(deviceId: string, updateModel: SessionUpdateModel) {
    try {
      const session = await this.dataSource.query(
        `
      UPDATE "Sessions"
      SET "lastActiveDate" = $1, "expiredAt" = $2, "createdAt" = $3
      WHERE "deviceId" = $4 AND "isDeleted" = false`,
        [
          updateModel.lastActiveDate,
          updateModel.refreshToken.expiredAt,
          updateModel.refreshToken.createdAt,
          deviceId,
        ],
      );
      if (session[1] === 0)
        throw new UnauthorizedException('Session not found');
      return true;
    } catch {
      throw new Error();
    }
  }
}
