import {
  Controller,
  HttpCode,
  HttpStatus,
  Put,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { Request } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { ConnectQuizGameUseCaseCommand } from '../aplication.use.case/connect.quiz.game.use.case';

@Controller('/pair-game-quiz/pairs/')
export class PairQuizController {
  constructor(private commandBus: CommandBus) {}

  @Put('connection')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async connection(@Req() req: Request) {
    const { userId } = req.user.userId;
    const createGame = this.commandBus.execute(
      new ConnectQuizGameUseCaseCommand(userId),
    );
  }

  //
  //
  // @Put('/my-current/answers')
  // @UseGuards(AuthGuard)
  // @HttpCode(HttpStatus.OK)
  // async answers()
}
