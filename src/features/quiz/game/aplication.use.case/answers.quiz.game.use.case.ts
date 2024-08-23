import { Answer } from '../domain/answers.on.questions.entity';
import { AnswerPlayer } from '../api/model/input/input.answers';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ExceptionResultType,
  ResultCode,
} from '../../../../common/exception-filters/exception.handler';
import { UsersQueryRepositorySql } from '../../../users/sql.infrastructure/users-query-repository-sql';
import { GameQueryRepository } from '../infrastructure.sql/query/game.query.repository';
import { AnswersStatuses } from '../../enums/answers.statuses';
import { SaveRepository } from '../infrastructure.sql/save.repository';
import { GameStatuses } from '../../enums/game.statuses';
import { add } from 'date-fns';
import { GameFinishedEvent } from '../event-emitter/event/game.finished';
import { EventEmitter2 } from '@nestjs/event-emitter';

export class SendAnswerUseCaseCommand {
  constructor(
    public inputModel: AnswerPlayer,
    public userId: string,
  ) {}
}
@CommandHandler(SendAnswerUseCaseCommand)
export class SendAnswerUseCase
  implements
    ICommandHandler<SendAnswerUseCaseCommand, ExceptionResultType<boolean>>
{
  constructor(
    private readonly usersQueryRepository: UsersQueryRepositorySql,
    private readonly gameQueryRepository: GameQueryRepository,
    private readonly saveRepository: SaveRepository,
    private readonly eventEmit: EventEmitter2,
  ) {}

  async execute(
    command: SendAnswerUseCaseCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const date = new Date();
    //Находим юзера
    const user = await this.usersQueryRepository.getById(command.userId);
    console.log('UseCase user*', user);
    if (!user)
      return {
        data: false,
        code: ResultCode.NotFound,
        field: 'userId_UseCase',
        message: 'User not found, bro!',
      };
    //Находим по юзеру id игрока
    const playerId = await this.gameQueryRepository.findPlayerIdByUserId(
      command.userId,
    );
    console.log('UseCase playerId*', playerId);
    if (!playerId) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: 'playerId_UseCase',
        message: 'User in table player not found, bro!',
      };
    }

    const currentGame = await this.gameQueryRepository.findGameForAnswer(
      command.userId,
    );
    console.log('UseCase currentGame*', currentGame);
    if (!currentGame) {
      // Если текущий пользователь не находится в активной паре или пользователь находится в активной паре, но уже ответил на все вопросы
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    let currentPlayer = currentGame.playerOne;
    console.log('UseCase currentPlayer*', currentPlayer);
    //если второй или прилетел userId второго user
    if (
      currentGame.playerTwo &&
      command.userId === currentGame.playerTwo.user.id
    ) {
      currentPlayer = currentGame.playerTwo;
    }

    // Проверяем лимит ответов
    if (currentPlayer.answers.length >= 5) {
      return {
        data: false,
        code: ResultCode.Forbidden,
        message:
          'You have already answered 5 questions and cannot submit more answers.',
      };
    }

    const questionIndex = currentPlayer.answers.length;

    if (questionIndex === 5) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    const currentQuestion = currentGame.questions[questionIndex];
    //проверяем прилетевший ответ текущего игрока с правильными ответами в массиве correctAnswers, если не найдёт, в answerCheck будет undefined
    let answerStatus = AnswersStatuses.INCORRECT;
    const answerCheck = currentQuestion?.correctAnswers.includes(
      command.inputModel.answer,
    );
    console.log('UseCase answerCheck*', answerCheck);
    if (answerCheck) {
      answerStatus = AnswersStatuses.CORRECT;
      currentPlayer.score += 1;
      await this.saveRepository.save(currentPlayer); //сохраняем полученные результаты
    }
    //создаем новый объект ответа на вопрос, сохраняет его в базе данных и подсчитывает количество ответов от двух игроков в текущей игре.zaebavsya
    const answer = new Answer();
    answer.player = currentPlayer;
    answer.question = currentQuestion;
    answer.answerStatus = answerStatus;
    answer.addedAt = new Date();
    await this.saveRepository.save(answer);
    console.log('Use Case !!!!!!!!!! ', answer);

    const playerOneAnswersCount = currentGame.playerOne.answers.length;
    console.log('UseCase playerOneAnswersCount', playerOneAnswersCount);
    const playerTwoAnswersCount = currentGame.playerTwo.answers.length;
    console.log('UseCase playerTwoAnswersCount', playerTwoAnswersCount);
    try {
      //Переменная extraPoint используется для отслеживания того, было ли уже добавлено дополнительное очко игроку в текущей логике.
      let extraPoint = false;

      if (
        //Проверяется, достиг ли какой-либо из игроков 5 ответов.
        (playerOneAnswersCount + 1 === 5 &&
          currentGame.playerOne.id === currentPlayer.id) ||
        (playerTwoAnswersCount + 1 === 5 &&
          currentGame.playerTwo.id === currentPlayer.id)
      ) {
        if (
          //Проверка даты истечения
          currentGame.expGameDate !== null && //игра началась то?
          date > currentGame.expGameDate //Если текущая дата превысила установленную дату истечения игры (expGameDate), игра завершается
        ) {
          currentGame.finishGameDate = date;
          currentGame.status = GameStatuses.FINISHED;

          await this.saveRepository.save(currentGame);

          return {
            data: false,
            code: ResultCode.Forbidden,
          };
        }
        //Присуждение дополнительного очка:
        let fastPlayer = currentGame.playerOne;

        if (playerTwoAnswersCount + 1 === 5) {
          fastPlayer = currentGame.playerTwo;
        }

        if (fastPlayer.score !== 0 && !extraPoint) {
          fastPlayer.score += 1;
          extraPoint = true;
        }

        await this.saveRepository.save(fastPlayer);
        //Обновление статуса игры:
        // Если игра еще не завершена, она остается активной:
        //   Статус игры устанавливается на ACTIVE.
        //   Дата завершения игры сбрасывается.
        //   Устанавливается новая дата истечения через 10 секунд от текущего времени.
        currentGame.status = GameStatuses.ACTIVE;
        currentGame.finishGameDate = null;
        currentGame.expGameDate = add(new Date(), {
          seconds: 10,
        });
        await this.saveRepository.save(currentGame);
      }
    } catch (e) {
      console.error(e);
    } finally {
      //Этот блок выполняется независимо от того, было ли выброшено исключение или нет. Он используется для выполнения действий, которые должны произойти в любом случае.
      //Проверка даты истечения и завершение игры:
      const date = new Date();

      if (currentGame.expGameDate !== null && date > currentGame.expGameDate) {
        currentGame.finishGameDate = date;
        currentGame.status = GameStatuses.FINISHED;

        await this.saveRepository.save(currentGame);
      }
      //Создается событие GameFinishedEvent, содержащее информацию о завершенной игре:
      // gameId: Идентификатор игры.
      // expDate: Дата истечения игры.
      // date: Текущая дата.
      // Событие отправляется через eventEmitter, уведомляя подписчиков о том, что игра завершена.

      const gameFinishedEvent = new GameFinishedEvent();
      gameFinishedEvent.gameId = currentGame.id;
      gameFinishedEvent.expDate = currentGame.expGameDate;
      gameFinishedEvent.date = date;
      this.eventEmit.emit('game.finished', gameFinishedEvent);
    }

    return {
      data: true,
      code: ResultCode.Success,
      response: currentGame.id,
    };
  }
}
