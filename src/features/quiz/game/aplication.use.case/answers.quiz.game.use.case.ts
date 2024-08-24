import { Answer } from '../domain/answers.on.questions.entity';
import { AnswerPlayer } from '../api/model/input/input.answers';
import { CommandHandler } from '@nestjs/cqrs';
import {
  ExceptionResultType,
  ResultCode,
} from '../../../../common/exception-filters/exception.handler';
import { UsersQueryRepositorySql } from '../../../users/sql.infrastructure/users-query-repository-sql';
import { GameQueryRepository } from '../infrastructure.sql/query/game.query.repository';
import { AnswersStatuses } from '../../enums/answers.statuses';
import { TransactionsRepository } from '../infrastructure.sql/transactionsRepository';
import { GameStatuses } from '../../enums/game.statuses';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TransactionBaseUseCase } from '../../../../base/usecases/transaction-base.usecase';
import { DataSource, EntityManager } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';

export class SendAnswerUseCaseCommand {
  constructor(
    public inputModel: AnswerPlayer,
    public userId: string,
  ) {}
}
@CommandHandler(SendAnswerUseCaseCommand)
export class SendAnswerUseCase extends TransactionBaseUseCase<
  SendAnswerUseCaseCommand,
  ExceptionResultType<boolean>
> {
  constructor(
    protected readonly dataSource: DataSource,
    private readonly usersQueryRepository: UsersQueryRepositorySql,
    private readonly gameQueryRepository: GameQueryRepository,
    private readonly transactionsRepository: TransactionsRepository,
    private readonly eventEmit: EventEmitter2,
  ) {
    super(dataSource); // это вызов конструктора родительского класса (TransactionBaseUseCase) из конструктора дочернего класса (QuizSendAnswerUseCase).
  }

  async doLogic(
    command: SendAnswerUseCaseCommand,
    manager: EntityManager,
  ): Promise<ExceptionResultType<boolean>> {
    const date = new Date();
    //Находим юзера
    const user = await this.usersQueryRepository.getById(
      command.userId,
      manager,
    );
    console.log('UseCase user*', user);
    if (!user)
      return {
        data: false,
        code: ResultCode.NotFound,
        field: 'userId_UseCase',
        message: 'User not found, bro!',
      };

    const currentGame = await this.gameQueryRepository.findGameForAnswer(
      command.userId,
      manager,
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

    const questionIndex = currentPlayer.answers.length;

    if (questionIndex >= 5) {
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
      await this.transactionsRepository.save(currentPlayer, manager); //сохраняем полученные результаты
    }
    //создаем новый объект ответа на вопрос, сохраняет его в базе данных и подсчитывает количество ответов от двух игроков в текущей игре.
    const answer = new Answer();
    answer.player = currentPlayer;
    answer.question = currentQuestion;
    answer.answerStatus = answerStatus;
    answer.addedAt = new Date();
    await this.transactionsRepository.save(answer, manager);
    console.log('Use Case !!!!!!!!!! ', answer);

    // const playerOneAnswersCount = currentGame.playerOne.answers.length;
    // console.log('UseCase playerOneAnswersCount', playerOneAnswersCount);
    // const playerTwoAnswersCount = currentGame.playerTwo.answers.length;
    // console.log('UseCase playerTwoAnswersCount', playerTwoAnswersCount);
    try {
      const currentGameFinished =
        await this.gameQueryRepository.findGameForAnswer(
          command.userId,
          manager,
        );
      const playerOneAnswersCount =
        currentGameFinished!.playerOne.answers.length;
      console.log('UseCase playerOneAnswersCount', playerOneAnswersCount);
      const playerTwoAnswersCount =
        currentGameFinished!.playerTwo.answers.length;
      console.log('UseCase playerTwoAnswersCount', playerTwoAnswersCount);
      // Проверяем, достиг ли какой-либо из игроков 5 ответов
      // Проверка завершения игры
      // const allPlayersReachedMax =
      //   playerOneAnswersCount === 5 && playerTwoAnswersCount === 5;

      const bothPlayersReachedMax =
        playerOneAnswersCount === 5 && playerTwoAnswersCount === 5;

      const currentPlayerReachedMax =
        (playerOneAnswersCount === 5 &&
          currentGameFinished!.playerOne.id === currentPlayer.id) ||
        (playerTwoAnswersCount === 5 &&
          currentGameFinished!.playerTwo.id === currentPlayer.id);
      console.log('Player One Answers Count:', playerOneAnswersCount);
      console.log('Player Two Answers Count:', playerTwoAnswersCount);

      // console.log('All Players Reached Max:', allPlayersReachedMax);
      // Если оба игрока достигли 5 ответов, завершаем игру.
      // Или текущий игрок достиг 5 ответов, а другой игрок не достиг 5 ответов.
      if (bothPlayersReachedMax) {
        console.log('Updating game status to FINISHED');
        currentGame.finishGameDate = date;
        currentGame.status = GameStatuses.FINISHED;
        try {
          await this.transactionsRepository.save(currentGame, manager);
          console.log('Game status updated');
        } catch (error) {
          console.error('Error saving game status:', error);
        }
      }
      // Проверяем, что игрок ответил на все вопросы первым
      const isFirstPlayerFinished = playerOneAnswersCount === 5;
      const isSecondPlayerFinished = playerTwoAnswersCount === 5;

      const playerOneCorrectAnswers =
        currentGameFinished!.playerOne.answers.filter(
          (answer) => answer.answerStatus === AnswersStatuses.CORRECT,
        ).length;

      const playerTwoCorrectAnswers =
        currentGameFinished!.playerTwo.answers.filter(
          (answer) => answer.answerStatus === AnswersStatuses.CORRECT,
        ).length;

      console.log(
        currentGame.playerOne.answers[4]?.addedAt.getDate(),
        ' currentGame.playerOne.answers[4]?.addedAt.getDate()',
      );
      console.log(
        currentGame.playerTwo.answers[4]?.addedAt.getDate(),
        '  currentGame.playerTwo.answers[4]?.addedAt.getDate()',
      );
      console.log(
        currentGame.playerOne.answers[4]?.addedAt.getDate() <
          currentGame.playerTwo.answers[4]?.addedAt.getDate(),
        ' check',
      );
      // Определяем победителя и начисляем дополнительные баллы
      if (bothPlayersReachedMax) {
        if (
          currentGameFinished!.playerOne.answers[4]?.addedAt.toISOString() <
          currentGameFinished!.playerTwo.answers[4]?.addedAt.toISOString()
        ) {
          currentGameFinished!.playerOne.score += Number(
            playerOneCorrectAnswers > 0,
          ); // Дополнительный балл
          await this.transactionsRepository.save(
            currentGameFinished!.playerOne,
            manager,
          );
        } else if (
          currentGameFinished!.playerOne.answers[4]?.addedAt.toISOString() >
          currentGameFinished!.playerTwo.answers[4]?.addedAt.toISOString()
        ) {
          currentGameFinished!.playerTwo.score += Number(
            playerTwoCorrectAnswers > 0,
          ); // Дополнительный балл
          await this.transactionsRepository.save(
            currentGameFinished!.playerTwo,
            manager,
          );
        } else {
          throw new InternalServerErrorException('mismatch in date comparison');
        }
      }
      // if (
      //   isFirstPlayerFinished &&
      //   !isSecondPlayerFinished &&
      //   playerOneCorrectAnswers >= 1
      // ) {
      //   // Игрок 1 ответил на все вопросы первым
      //   currentGameFinished!.playerOne.score += 1; // Дополнительный балл
      //   await this.transactionsRepository.save(
      //     currentGameFinished!.playerOne,
      //     manager,
      //   );
      // } else if (
      //   isSecondPlayerFinished &&
      //   !isFirstPlayerFinished &&
      //   playerTwoCorrectAnswers >= 1
      // ) {
      //   // Игрок 2 ответил на все вопросы первым
      //   currentGameFinished!.playerTwo.score += 1; // Дополнительный балл
      //
      //   await this.transactionsRepository.save(
      //     currentGameFinished!.playerTwo,
      //     manager,
      //   );
      // }

      // // Создаем событие завершения игры
      // const gameFinishedEvent = new GameFinishedEvent();
      // gameFinishedEvent.gameId = currentGame.id;
      // gameFinishedEvent.date = date;
      // await this.transactionsRepository.save()
      // //this.eventEmit.emit('game.finished', gameFinishedEvent);

      // return {
      //   data: false,
      //   code: ResultCode.Forbidden,
      // };
    } catch (e) {
      console.error(e);
      throw e;
    }
    // try {
    //   //Переменная extraPoint используется для отслеживания того, было ли уже добавлено дополнительное очко игроку в текущей логике.
    //   let extraPoint = false;
    //
    //   if (
    //     //Проверяется, достиг ли какой-либо из игроков 5 ответов.
    //     (playerOneAnswersCount + 1 === 5 &&
    //       currentGame.playerOne.id === currentPlayer.id) ||
    //     (playerTwoAnswersCount + 1 === 5 &&
    //       currentGame.playerTwo.id === currentPlayer.id)
    //   ) {
    //     if (
    //       //Проверка даты истечения
    //       currentGame.expGameDate !== null && //игра началась то?
    //       date > currentGame.expGameDate //Если текущая дата превысила установленную дату истечения игры (expGameDate), игра завершается
    //     ) {
    //       currentGame.finishGameDate = date;
    //       currentGame.status = GameStatuses.FINISHED;
    //
    //       await this.transactionsRepository.save(currentGame, manager);
    //
    //       return {
    //         data: false,
    //         code: ResultCode.Forbidden,
    //       };
    //     }
    //     //Присуждение дополнительного очка:
    //     let fastPlayer = currentGame.playerOne;
    //
    //     if (playerTwoAnswersCount + 1 === 5) {
    //       fastPlayer = currentGame.playerTwo;
    //     }
    //
    //     if (fastPlayer.score !== 0 && !extraPoint) {
    //       fastPlayer.score += 1;
    //       extraPoint = true;
    //     }
    //
    //     await this.transactionsRepository.save(fastPlayer, manager);
    //     //Обновление статуса игры:
    //     // Если игра еще не завершена, она остается активной:
    //     //   Статус игры устанавливается на ACTIVE.
    //     //   Дата завершения игры сбрасывается.
    //     //   Устанавливается новая дата истечения через 10 секунд от текущего времени.
    //     currentGame.status = GameStatuses.ACTIVE;
    //     currentGame.finishGameDate = null;
    //     currentGame.expGameDate = add(new Date(), {
    //       seconds: 10,
    //     });
    //     await this.transactionsRepository.save(currentGame, manager);
    //   }
    // } catch (e) {
    //   console.error(e);
    //   throw e;
    // } finally {
    //   //Этот блок выполняется независимо от того, было ли выброшено исключение или нет. Он используется для выполнения действий, которые должны произойти в любом случае.
    //   //Проверка даты истечения и завершение игры:
    //   const date = new Date();
    //
    //   if (
    //     currentGame.expGameDate !== null /*&& date >= currentGame.expGameDate*/
    //   ) {
    //     currentGame.finishGameDate = date;
    //     currentGame.status = GameStatuses.FINISHED;
    //
    //     await this.transactionsRepository.save(currentGame, manager);
    //   }
    //   //Создается событие GameFinishedEvent, содержащее информацию о завершенной игре:
    //   // gameId: Идентификатор игры.
    //   // expDate: Дата истечения игры.
    //   // date: Текущая дата.
    //   // Событие отправляется через eventEmitter, уведомляя подписчиков о том, что игра завершена.
    //   if (
    //     //Проверяется, достиг ли какой-либо из игроков 5 ответов.
    //     playerOneAnswersCount === 5 ||
    //     playerTwoAnswersCount === 5
    //   ) {
    //     const gameFinishedEvent = new GameFinishedEvent();
    //     gameFinishedEvent.gameId = currentGame.id;
    //     gameFinishedEvent.expDate = currentGame.expGameDate;
    //     gameFinishedEvent.date = date;
    //     this.eventEmit.emit('game.finished', gameFinishedEvent);
    //   }
    // }

    return {
      data: true,
      code: ResultCode.Success,
      response: currentGame.id,
    };
  }
}
//Находим по юзеру id игрока
// const playerId = await this.gameQueryRepository.findPlayerIdByUserId(
//   command.userId,
//   manager,
// );
// console.log('UseCase playerId*', playerId);
// if (!playerId) {
//   return {
//     data: false,
//     code: ResultCode.NotFound,
//     field: 'playerId_UseCase',
//     message: 'User in table player not found, bro!',
//   };
// }
