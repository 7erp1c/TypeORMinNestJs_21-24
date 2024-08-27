import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { Request } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { ConnectQuizGameUseCaseCommand } from '../aplication.use.case/connect.quiz.game.use.case';
import {
  exceptionHandler,
  ResultCode,
} from '../../../../common/exception-filters/exception.handler';
import { GameQueryRepository } from '../infrastructure.sql/query/game.query.repository';
import { AnswerPlayer } from './model/input/input.answers';
import { SendAnswerUseCaseCommand } from '../aplication.use.case/answers.quiz.game.use.case';
import { InputUuid } from './model/input/input.uuid';
import { validate } from 'class-validator';
import { GameQueryGetAllRepository } from '../infrastructure.sql/query/game.query.get.all.repository';
import { QueryRequestType } from '../../../../base/adapters/query/types';
import {
  createQuery,
  createQueryGame,
} from '../../../../base/adapters/query/create.query';
import { MyStatisticQuery } from '../infrastructure.sql/query/get.my.statistic.query.repository';

@Controller('/pair-game-quiz/')
export class PairQuizController {
  constructor(
    private commandBus: CommandBus,
    private gameQueryRepository: GameQueryRepository,
    private readonly gameQueryGetAllRepository: GameQueryGetAllRepository,
    private readonly statistic: MyStatisticQuery,
  ) {}

  @Get('users/my-statistic')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async findMyStatistic(@Req() req: Request) {
    console.log(req.user.userId);
    const result = await this.statistic.getPlayerStatistic(req.user.userId);

    if (!result) {
      return exceptionHandler(
        ResultCode.NotFound,
        'Current game not found',
        '/get_findCurrentGame',
      );
    }

    return result;
  }

  @Get('pairs/my')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async findMyGame(@Req() req: Request, @Query() query: QueryRequestType) {
    const { sortData } = createQueryGame(query);
    const result =
      await this.gameQueryGetAllRepository.getMyGameHistoryByUserId(
        req.user.userId,
        sortData,
      );

    if (!result) {
      return exceptionHandler(
        ResultCode.NotFound,
        'Current game not found',
        '/get_findCurrentGame',
      );
    }

    return result;
  }

  @Get('pairs/my-current')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async findCurrentGame(@Req() req: Request) {
    const result = await this.gameQueryRepository.getGameByProvidedId(
      undefined,
      req.user.userId,
    );

    if (!result) {
      return exceptionHandler(
        ResultCode.NotFound,
        'Current game not found',
        '/get_findCurrentGame',
      );
    }

    return result;
  }

  @Get('pairs/:id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async findGameById(@Param('id') id: string, @Req() req: Request) {
    const input = new InputUuid();

    input.id = id;

    // Выполнение валидации
    const errors = await validate(input);
    if (errors.length > 0) {
      throw new BadRequestException([{ message: 'id invalid', field: 'id' }]);
    }
    try {
      return await this.gameQueryRepository.getGameByProvidedId(
        id,
        undefined,
        req.user.userId,
      );
    } catch (e) {
      if (e instanceof ForbiddenException) {
        throw e;
      } else {
        throw new NotFoundException('Resource not found');
      }
    }
  }

  @Post('pairs/connection')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async connection(@Req() req: Request) {
    console.log(req.user.userId);
    //проверяем юзерка на участие в игре, форбидден его🤦‍♂️
    await this.gameQueryRepository.activeGame(req.user.userId);

    const result = await this.commandBus.execute(
      new ConnectQuizGameUseCaseCommand(req.user.userId),
    );
    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result?.code, result?.message, result?.field);
    }

    return this.gameQueryRepository.getGameByProvidedId(
      result.response,
      undefined,
      req.user.userId,
    );
  }

  @Post('pairs/my-current/answers')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async answers(@Body() inputModel: AnswerPlayer, @Req() req: Request) {
    const toAnswer = await this.commandBus.execute(
      new SendAnswerUseCaseCommand(inputModel, req.user.userId),
    );

    if (toAnswer.code !== ResultCode.Success) {
      return exceptionHandler(toAnswer.code, toAnswer.message, toAnswer.field);
    }

    return this.gameQueryRepository.findAnswerInGame(
      toAnswer.response,
      req.user.userId,
    );
  }
}
