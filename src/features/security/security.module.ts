import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth/api/model/auth.controller';
import { DevicesController } from './devices/api/devices.controller';
import { AuthService } from './auth/aplication/auth.service';
import { DevicesService } from './devices/aplication/devices.service';
import { DevicesSchema, Session } from './devices/domain/device.entity';
import {
  RefreshTokenBlackList,
  RefreshTokenBlackListSchema,
} from './auth/domain/refresh.token.black.list.entity';
import { DeviceRepository } from './devices/infrastructure/device.repository';
import { SessionsQueryRepository } from './devices/infrastructure/device.query.repository';
import { EmailAdapter } from '../../common/service/email/email-adapter';
import { EmailsManager } from '../../common/service/email/email-manager';
import { TokenService } from '../../common/service/jwt/token.service';
import { DateCreate } from '../../base/adapters/get-current-date';
import { BcryptAdapter } from '../../base/adapters/bcrypt.adapter';
import { RandomNumberService } from '../../common/service/random/randomNumberUUVid';
import { RefreshTokenBlackRepository } from './auth/infrastructure/refresh.token.black.repository';
import { JwtService } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
import { RegistrationUserUseCase } from './auth/aplication.use.case/registration.user.use.case';
import { LoginUserUseCase } from './auth/aplication.use.case/login.user.use.case';
import { LogoutSessionUseCase } from './auth/aplication.use.case/logout.session.use.case';
import { DeviceRepositorySql } from './devices/infrastructure.sql/device.repository.sql';
import { RefreshTokenBlackRepositorySql } from './auth/infrastrucrure.sql/refresh.token.black.repository.sql';
import { SessionsQueryRepositorySql } from './devices/infrastructure.sql/device.query.repository.sql';
const useCase = [
  RegistrationUserUseCase,
  LoginUserUseCase,
  LogoutSessionUseCase,
];
const adapters = [
  EmailAdapter,
  EmailsManager,
  TokenService,
  BcryptAdapter,
  DateCreate,
];
@Module({
  imports: [
    CqrsModule,
    UsersModule,
    MongooseModule.forFeature([
      {
        name: RefreshTokenBlackList.name,
        schema: RefreshTokenBlackListSchema,
      },
      {
        name: Session.name,
        schema: DevicesSchema,
      },
    ]),
  ],
  controllers: [AuthController, DevicesController],
  providers: [
    AuthService,
    DevicesService,
    DeviceRepository,
    DeviceRepositorySql,
    RandomNumberService,
    JwtService,
    RefreshTokenBlackRepository,
    RefreshTokenBlackRepositorySql,
    SessionsQueryRepository,
    SessionsQueryRepositorySql,
    ...adapters,
    ...useCase,
  ],
  exports: [],
})
export class SecurityModule {}
