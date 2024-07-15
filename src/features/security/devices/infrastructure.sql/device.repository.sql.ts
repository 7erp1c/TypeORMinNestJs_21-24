import { InjectDataSource } from '@nestjs/typeorm';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  SessionModel,
  SessionUpdateModel,
} from '../api/model/input/session.input.models';
import { SessionDocument } from '../domain/device.entity';
@Injectable()
export class DeviceRepositorySql {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createNewSession(sessionModel: SessionModel) {
    try {
      const session = await this.dataSource.query(
        `
            INSERT INTO "Sessions"
            ("userId","deviceId","deviceTitle","ip",
            "lastActiveDate","createdAt","expiredAt")
            values($1,$2,$3,$4,
            $5,$6,$7)
            RETURNING id
        `,
        [
          sessionModel.userId,
          sessionModel.deviceId,
          sessionModel.deviceTitle,
          sessionModel.ip,
          sessionModel.lastActiveDate,
          sessionModel.refreshToken.createdAt,
          sessionModel.refreshToken.expiredAt,
        ],
      );
      return session;
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
       WHERE "userId" = \$1 AND "deviceId" <> \$2;`,
        [userId, deviceId],
      );
      if (sessions.length <= 0)
        throw new NotFoundException('Session not found');
      await this.dataSource.query(
        `DELETE FROM public."Sessions"
      WHERE "userId" = $1 AND "deviceId" <> $2;`,
        [userId, deviceId],
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  async deleteSessionById(deviceId: string, userId: string) {
    try {
      const result = await this.dataSource.query(
        `DELETE FROM "Sessions"
       WHERE "deviceId" = $1 AND "userId" = $2;`,
        [deviceId, userId],
      );

      if (result[1] === 0) {
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
               WHERE "deviceId" = $1`,
        [deviceId],
      );
      if (!session) throw new NotFoundException('Session not found');
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
      WHERE "deviceId" = $4`,
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
