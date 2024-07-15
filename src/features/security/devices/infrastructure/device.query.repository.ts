import { InjectModel } from '@nestjs/mongoose';
import { Session } from '../domain/device.entity';
import { Model } from 'mongoose';
import { SessionOutput } from '../api/model/output/output';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { sessionMapper } from '../api/model/output/mapper.devices';

export class SessionsQueryRepository {
  constructor(
    @InjectModel(Session.name) protected sessionModel: Model<Session>,
    protected jwtService: JwtService,
  ) {}
  async getSessionsByUserId(
    refreshTokenValue: string,
  ): Promise<SessionOutput[]> {
    const payload = this.jwtService.decode(refreshTokenValue);

    const sessions = await this.sessionModel
      .find({ userId: payload.userId })
      .lean();
    return sessions.map(sessionMapper);
  }
}
