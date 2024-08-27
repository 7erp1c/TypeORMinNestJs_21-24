// Моки зависимостей
import { beforeAll, describe } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import {
  ConnectQuizGameUseCase,
  ConnectQuizGameUseCaseCommand,
} from '../../src/features/quiz/game/aplication.use.case/connect.quiz.game.use.case';
import { UsersQueryRepositorySql } from '../../src/features/users/sql.infrastructure/users-query-repository-sql';
import { GameQueryRepository } from '../../src/features/quiz/game/infrastructure.sql/query/game.query.repository';
import { QuestionsQueryRepository } from '../../src/features/quiz/questions/infrastructure.sql/query/questions.query.repository';
import { TransactionsRepository } from '../../src/features/quiz/game/infrastructure.sql/transactionsRepository';
import { DataSource } from 'typeorm';
import mock from 'jest-mock-extended/lib/Mock';
import { ResultCode } from '../../src/common/exception-filters/exception.handler';
import { GameStatuses } from '../../src/features/quiz/enums/game.statuses';

const mockUserQueryRepository = mock<UsersQueryRepositorySql>();
const mockGameQueryRepository = mock<GameQueryRepository>();
const mockQuestionsQueryRepository = mock<QuestionsQueryRepository>();
const mockTransactionsRepository = mock<TransactionsRepository>();
const mockDataSource = mock<DataSource>();

describe('ConnectQuizGameUseCase Integration Test', () => {
  let useCase: ConnectQuizGameUseCase;
  let mockGameQueryRepository: GameQueryRepository;
  let mockUserQueryRepository: UsersQueryRepositorySql;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConnectQuizGameUseCase,
        {
          provide: UsersQueryRepositorySql,
          useValue: mockUserQueryRepository,
        },
        {
          provide: GameQueryRepository,
          useValue: mockGameQueryRepository,
        },
        {
          provide: QuestionsQueryRepository,
          useValue: mockQuestionsQueryRepository,
        },
        {
          provide: TransactionsRepository,
          useValue: mockTransactionsRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    })
      .overrideProvider(UsersQueryRepositorySql)
      .useValue(mockUserQueryRepository)
      .overrideProvider(GameQueryRepository)
      .useValue(mockGameQueryRepository)
      .overrideProvider(QuestionsQueryRepository)
      .useValue(mockQuestionsQueryRepository)
      .overrideProvider(TransactionsRepository)
      .useValue(mockTransactionsRepository)
      .overrideProvider(DataSource)
      .useValue(mockDataSource)
      .compile();

    useCase = module.get<ConnectQuizGameUseCase>(
      ConnectQuizGameUseCase,
    ) as ConnectQuizGameUseCase;
  });

  it('should create a new game with a player when no existing game found', async () => {
    // Arrange
    const userId = 'user-id';
    mockUserQueryRepository.getById.mockResolvedValue({ id: userId });
    mockGameQueryRepository.findGameForConnection.mockResolvedValue(null);
    mockQuestionsQueryRepository.findRandomQuestions.mockResolvedValue([]);

    const command = new ConnectQuizGameUseCaseCommand(userId);

    // Act
    const result = await useCase.execute(command);

    // Assert
    expect(result.data).toBe(true);
    expect(result.code).toBe(ResultCode.Success);
    expect(result.response).toBeDefined();
    expect(mockTransactionsRepository.save).toHaveBeenCalledTimes(2);
  });

  it('should return forbidden if the game is already in progress', async () => {
    // Arrange
    const userId = 'user-id';
    const existingGame = {
      playerOne: { user: { id: userId } },
      status: GameStatuses.PENDING_SECOND_PLAYER,
    };
    mockUserQueryRepository.getById.mockResolvedValue({ id: userId });
    mockGameQueryRepository.findGameForConnection.mockResolvedValue(
      existingGame,
    );

    const command = new ConnectQuizGameUseCaseCommand(userId);

    // Act
    const result = await useCase.execute(command);

    // Assert
    expect(result.data).toBe(false);
    expect(result.code).toBe(ResultCode.Forbidden);
    expect(mockTransactionsRepository.save).not.toHaveBeenCalled();
  });
});
