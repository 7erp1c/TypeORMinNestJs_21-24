import { InjectModel } from '@nestjs/mongoose';
import { Session } from '../domain/device.entity';
import { Model } from 'mongoose';
import { SessionOutput } from '../api/model/output/output';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { sessionMapper } from '../api/model/output/mapper.devices';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class SessionsQueryRepositorySql {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected jwtService: JwtService,
  ) {}
  async getSessionsByUserId(
    refreshTokenValue: string,
  ): Promise<SessionOutput[]> {
    const payload = this.jwtService.decode(refreshTokenValue);
    console.log('', payload);

    const sessions = await this.dataSource.query(
      `
    SELECT * FROM "Sessions" 
     WHERE "userId" = $1`,
      [payload.userId],
    );
    console.log('sessions', sessions[0], sessions[1]);
    return sessions.map(sessionMapper);
  }
}
