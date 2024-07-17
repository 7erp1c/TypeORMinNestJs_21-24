import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NotFoundException } from '@nestjs/common';
import { Session } from '../domain/device.entity.type.orm';

export class SessionsQueryRepositorySql {
  constructor(
    @InjectRepository(Session)
    private readonly repository: Repository<Session>,
    protected jwtService: JwtService,
  ) {}
  async getSessionsByUserId(refreshTokenValue: string): Promise<any> {
    try {
      const payload = this.jwtService.decode(refreshTokenValue);
      const userId: string = payload.userId;
      console.log('Get*****', userId);

      const query = await this.repository
        .createQueryBuilder('s')
        .select([
          's.ip AS ip',
          `s.deviceTitle AS title`,
          's.lastActiveDate AS lastActiveDate',
          's.deviceId AS deviceId',
        ])
        .where('s.userId = :userId', { userId })
        .andWhere('s.isDeleted = false');

      console.log('Query: ', query.getSql());
      const result = await query.getRawMany();
      if (!result) throw new NotFoundException();

      return result;
    } catch (e) {
      throw new NotFoundException(e);
    }

    // console.log('sessions', sessions[0], sessions[1]);
    // return sessions.map(sessionMapper);
  }
}
