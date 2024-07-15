import {
  SessionInputModel,
  SessionModel,
  SessionUpdateModel,
} from '../api/model/input/session.input.models';

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { DeviceRepository } from '../infrastructure/device.repository';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../../auth/setting/constants';
import { RandomNumberService } from '../../../../common/service/random/randomNumberUUVid';
import { TokenService } from '../../../../common/service/jwt/token.service';
import { DeviceRepositorySql } from '../infrastructure.sql/device.repository.sql';
@Injectable()
export class DevicesService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly jwtService: JwtService,
    protected randomNumberService: RandomNumberService,
    private readonly deviceRepository: DeviceRepository,
    private readonly deviceRepositorySql: DeviceRepositorySql,
  ) {}
  async createSession(
    sessionInputModel: SessionInputModel,
    userId: string,
    userName: string,
  ) {
    const deviceId = await this.randomNumberService.generateRandomUUID();
    const tokenAccess = await this.tokenService.createJWT(userId, userName);
    const tokenRefresh = await this.tokenService.createJWTRefresh(
      userId,
      userName,
      deviceId,
    );
    if (!tokenAccess || !tokenRefresh)
      throw new UnauthorizedException('Token not created');
    const tokenData = await this.tokenService.decodeRefreshToken(tokenRefresh);
    if (!tokenData) throw new UnauthorizedException('Token not decoded');

    const sessionModel: SessionModel = {
      userId: userId,
      deviceId: deviceId,
      deviceTitle: sessionInputModel.deviceTitle,
      ip: sessionInputModel.ip,
      lastActiveDate: tokenData.iat,
      refreshToken: {
        createdAt: tokenData.iat,
        expiredAt: tokenData.exp,
      },
    };

    //await this.deviceRepository.createNewSession(sessionModel); //mongoose
    await this.deviceRepositorySql.createNewSession(sessionModel);

    //возвращаем two token:
    return { tokenAccess, tokenRefresh };
  }

  async terminateSession(deviceId: string, refreshTokenValue: string) {
    const payload = await this.jwtService.verifyAsync(refreshTokenValue, {
      secret: jwtConstants.secret,
    });
    if (!payload) throw new UnauthorizedException('Payload empty');

    const currentUserId = payload.userId;

    const sessionUserId =
      //await this.deviceRepositorySql.getSessionByDeviceId(deviceId);//mongoose
      await this.deviceRepositorySql.getSessionByDeviceId(deviceId);

    if (!sessionUserId) throw new NotFoundException('Session not found');
    if (currentUserId !== sessionUserId.userId)
      throw new ForbiddenException('The session does not belong to the user');

    //return await this.deviceRepository.deleteSessionById(deviceId);//mongoose
    return await this.deviceRepositorySql.deleteSessionById(
      deviceId,
      currentUserId,
    );
  }

  async terminateSessionForLogout(deviceId: string, currentUserId: string) {
    const sessionUserId =
      // await this.deviceRepository.getSessionByDeviceId(deviceId); mongoose
      await this.deviceRepositorySql.getSessionByDeviceId(deviceId);

    if (!sessionUserId) throw new UnauthorizedException('Session not found');
    //if (currentUserId !== sessionUserId)//mongoose
    if (currentUserId !== sessionUserId.userId)
      throw new ForbiddenException('The session does not belong to the user');
    //return await this.deviceRepository.deleteSessionById(deviceId)//mongoose
    return await this.deviceRepositorySql.deleteSessionById(
      deviceId,
      currentUserId,
    );
  }

  async terminateAllSessions(refreshTokenValue: string) {
    const payload = this.jwtService.decode(refreshTokenValue);
    if (!payload) throw new UnauthorizedException();
    const currentUserId = payload.userId;
    const currentSessionDeviceId = payload.deviceId;

    // await this.deviceRepository.deleteSessionsExpectCurrent(
    //   currentUserId,
    //   currentSessionDeviceId,
    // ); // mongoose
    await this.deviceRepositorySql.deleteSessionsExpectCurrent(
      currentUserId,
      currentSessionDeviceId,
    );
    return;
  }

  async updateSession(userId: string, deviceId: string, userName: string) {
    const tokenAccess = await this.tokenService.createJWT(userId, userName);
    const tokenRefresh = await this.tokenService.createJWTRefresh(
      userId,
      userName,
      deviceId,
    );
    const tokenData = await this.tokenService.decodeRefreshToken(tokenRefresh);
    if (!tokenData) throw new UnauthorizedException('Token not decoded');
    const sessionUpdateModel: SessionUpdateModel = {
      lastActiveDate: tokenData.iat,
      refreshToken: {
        createdAt: tokenData.iat,
        expiredAt: tokenData.exp,
      },
    };
    // await this.deviceRepository.updateExistSession( //mongoose
    await this.deviceRepositorySql.updateExistSession(
      deviceId,
      sessionUpdateModel,
    );
    return { tokenAccess, tokenRefresh };
  }
}
