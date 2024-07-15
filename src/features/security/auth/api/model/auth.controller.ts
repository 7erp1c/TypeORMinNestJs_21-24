import { SessionInputModel } from '../../../devices/api/model/input/session.input.models';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../../aplication/auth.service';
import { UsersQueryRepository } from '../../../../users/infrastructure/users.query-repository';
import {
  ConfirmationCodeInputModel,
  LoginOrEmailInputModel,
  NewPasswordInputModel,
  UserEmailInputModel,
} from './input/loginOrEmailInputModel';
import {
  BadRequestResponse,
  NoContentResponse,
  TooManyRequestsResponse,
} from '../../../../../common/swagger/response.dto';
import { CodeDto } from '../../../../../common/swagger/input.type';
import { UserCreateInputModel } from '../../../../users/api/models/input/create.user.input.model';
import { AuthGuard } from '../../../../../common/guards/auth.guard';
import { Request, Response } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { RegistrationUserUseCaseCommand } from '../../aplication.use.case/registration.user.use.case';
import { LoginUserUseCaseCommand } from '../../aplication.use.case/login.user.use.case';
import { LogoutSessionUseCaseCommand } from '../../aplication.use.case/logout.session.use.case';
import { UsersQueryRepositorySql } from '../../../../users/sql.infrastructure/users-query-repository-sql';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    protected authService: AuthService,
    protected usersQueryRepository: UsersQueryRepository,
    protected usersQueryRepositorySql: UsersQueryRepositorySql,
    protected commandBus: CommandBus,
  ) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('new-password')
  async newPassword(@Body() inputModelDto: NewPasswordInputModel) {
    await this.authService.newPassword(inputModelDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('password-recovery')
  async passwordRecovery(@Body() inputModelDto: UserEmailInputModel) {
    return await this.authService.passwordRecovery(inputModelDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiBody({ type: LoginOrEmailInputModel })
  async logInUser(
    @Body() inputModelDto: LoginOrEmailInputModel,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const sessionInputModel: SessionInputModel = {
      deviceTitle: req.header('user-agent')?.split(' ')[1] || 'unknown',
      ip: req.ip || 'unknown',
    };
    const login = await this.commandBus.execute(
      new LoginUserUseCaseCommand(inputModelDto, sessionInputModel),
    );
    console.log('refreshToken', login.tokenRefresh);
    console.log('accessToken', login.tokenAccess);
    res.cookie('refreshToken', login.tokenRefresh, {
      httpOnly: true,
      secure: true,
    });

    return { accessToken: login.tokenAccess };
  }
  @SkipThrottle()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async getNewRefreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      console.log('Controller', req.cookies.refreshToken);
      const updatePairToken = await this.authService.updatePairToken(
        req.cookies.refreshToken,
      );
      res.cookie('refreshToken', updatePairToken.tokenRefresh, {
        httpOnly: true,
        secure: true,
      });
      return { accessToken: updatePairToken.tokenAccess };
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-confirmation')
  @ApiBody({ type: CodeDto })
  @BadRequestResponse
  @TooManyRequestsResponse
  @NoContentResponse
  async registrationConfirmation(
    @Body() inputModel: ConfirmationCodeInputModel,
  ) {
    return await this.authService.registrationConfirmation(inputModel);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  async registration(@Body() inputModelDto: UserCreateInputModel) {
    return await this.commandBus.execute(
      new RegistrationUserUseCaseCommand(inputModelDto),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-email-resending')
  async registrationEmailResending(@Body() inputModelDto: UserEmailInputModel) {
    return await this.authService.registrationEmailResending(inputModelDto);
  }

  @SkipThrottle()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request) {
    try {
      console.log('controller', req.cookies.refreshToken);
      await this.commandBus.execute(
        new LogoutSessionUseCaseCommand(req.cookies.refreshToken),
      );
      return;
    } catch {
      throw new UnauthorizedException();
    }
  }

  @SkipThrottle()
  @Get('me')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMe(@Req() req: Request) {
    try {
      //return this.usersQueryRepository.getUserAuthMe(req.user.userId); //mongoose
      return this.usersQueryRepositorySql.getUserAuthMe(req.user.userId);
    } catch {
      throw new UnauthorizedException();
    }
  }
}
