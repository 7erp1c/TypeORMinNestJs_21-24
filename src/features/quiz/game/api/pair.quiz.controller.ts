import {
  BadRequestException,
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
import { InputUuid } from './model/input/input.uuid';
import { validate } from 'class-validator';

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
  async findGameById(@Param('id') id: string, @Req() req: Request) {
    const input = new InputUuid();
    input.id = id;

    // Выполнение валидации
    const errors = await validate(input);
    if (errors.length > 0) {
      throw new BadRequestException([{ message: 'id invalid', field: 'id' }]);
    }
    return await this.gameQueryRepository.getGameByProvidedId(
      id,
      undefined,
      req.user.userId,
    );
  }

  @Post('/connection')
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

  @Post('/my-current/answers')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async answers(@Body() inputModel: AnswerPlayer, @Req() req: Request) {
    console.log(req.user.userId);
    console.log(inputModel.answer);
    await this.gameQueryRepository.falseStart(req.user.userId);

    // Проверяем количество ответов в активной игре
    await this.gameQueryRepository.getAnswersCountInActiveGame(req.user.userId);

    const toAnswer = await this.commandBus.execute(
      new SendAnswerUseCaseCommand(inputModel, req.user.userId),
    );

    if (toAnswer.code !== ResultCode.Success) {
      return exceptionHandler(toAnswer.code, toAnswer.message, toAnswer.field);
    }
    console.log('Controller toAnswer result', toAnswer.response);

    return this.gameQueryRepository.findAnswerInGame(
      toAnswer.response,
      req.user.userId,
    );
  }
}
