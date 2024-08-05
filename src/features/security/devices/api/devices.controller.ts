import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { SessionsQueryRepository } from '../infrastructure/device.query.repository';
import { DevicesService } from '../aplication/devices.service';
import { SessionsQueryRepositorySql } from '../infrastructure.sql/device.query.repository.sql';
@ApiTags('Security')
@Controller('security')
export class DevicesController {
  constructor(
    protected sessionsQueryRepository: SessionsQueryRepository,
    protected sessionsQueryRepositorySql: SessionsQueryRepositorySql,
    protected sessionsService: DevicesService,
  ) {}
  @Get('devices')
  @HttpCode(HttpStatus.OK)
  async getDevices(@Req() req: Request) {
    try {
      //return await this.sessionsQueryRepository.getSessionsByUserId(//mongoose
      return await this.sessionsQueryRepositorySql.getSessionsByUserId(
        req.cookies.refreshToken,
      );
    } catch {
      throw new UnauthorizedException(
        'DeviceController.getDevices, in cookie no refreshToken',
      );
    }
  }

  @Delete('devices')
  @HttpCode(HttpStatus.NO_CONTENT)
  async terminateAllActiveSessions(@Req() req: Request) {
    await this.sessionsService.terminateAllSessions(req.cookies.refreshToken);
    return;
  }

  @Delete('devices/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async terminateSession(@Param('id') id: string, @Req() req: Request) {
    console.log('controller', req.cookies.refreshToken);
    if (!req.cookies.refreshToken)
      throw new UnauthorizedException('Cookie empty');
    return await this.sessionsService.terminateSession(
      id,
      req.cookies.refreshToken,
    );
  }
}
