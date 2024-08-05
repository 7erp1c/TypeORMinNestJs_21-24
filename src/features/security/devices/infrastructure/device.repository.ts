import { InjectModel } from '@nestjs/mongoose';
import {
  SessionModel,
  SessionUpdateModel,
} from '../api/model/input/session.input.models';
import { Session, SessionDocument } from '../domain/device.entity';
import { Model } from 'mongoose';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
@Injectable()
export class DeviceRepository {
  constructor(
    @InjectModel(Session.name) protected sessionsModel: Model<Session>,
  ) {}

  async updateExistSession(deviceId: string, updateModel: SessionUpdateModel) {
    try {
      const session = await this.sessionsModel
        .findOne({
          deviceId: deviceId,
        })
        .exec();
      if (!session) throw new UnauthorizedException('Session not found');
      session.lastActiveDate = updateModel.lastActiveDate;
      session.refreshToken.expiredAt = updateModel.refreshToken.expiredAt;
      session.refreshToken.createdAt = updateModel.refreshToken.createdAt;
      await session.save();
    } catch {
      throw new Error();
    }
  }

  async createNewSession(sessionModel: SessionModel) {
    try {
      const session: SessionDocument =
        await this.sessionsModel.create(sessionModel);
      return session._id.toString();
    } catch (error) {
      console.error('An error occurred while creating a new session:', error);
      throw new Error('Failed to create a new session');
    }
  }

  async deleteSessionsExpectCurrent(userId: string, deviceId: string) {
    try {
      await this.sessionsModel.deleteMany({
        $and: [{ userId: userId }, { deviceId: { $not: { $eq: deviceId } } }],
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async deleteSessionById(deviceId: string) {
    try {
      const result = await this.sessionsModel.deleteOne({ deviceId: deviceId });
      if (result.deletedCount === 0)
        throw new NotFoundException('Session not found');
      else return true;
    } catch {
      throw new NotFoundException('Session not found');
    }
  }

  async getSessionByDeviceId(deviceId: string) {
    try {
      const session = await this.sessionsModel
        .findOne({ deviceId: deviceId })
        .lean();
      if (!session) throw new NotFoundException('Session not found');
      return session.userId;
    } catch {
      throw new NotFoundException('Session not found');
    }
  }
}
