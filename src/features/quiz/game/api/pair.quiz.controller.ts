import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
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

@Controller('/pair-game-quiz/pairs')
export class PairQuizController {
  constructor(
    private commandBus: CommandBus,
    private gameQueryRepository: GameQueryRepository,
  ) {}

  @Get('/my-current')
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

  @Get('/:id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async findGameById(@Param(':id') id: string) {
    const result = await this.gameQueryRepository.getGameByProvidedId(
      id,
      undefined,
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

  @Post('/connection')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async connection(@Req() req: Request) {
    console.log(req.user.userId);

    const result = await this.commandBus.execute(
      new ConnectQuizGameUseCaseCommand(req.user.userId),
    );
    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return this.gameQueryRepository.getGameByProvidedId(result.response);
  }

  @Post('/my-current/answers')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async answers(@Body() inputModel: AnswerPlayer, @Req() req: Request) {
    console.log(req.user.userId);
    console.log(inputModel.answer);

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
