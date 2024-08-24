import { DataSource, EntityManager } from 'typeorm';

export abstract class TransactionBaseUseCase<I, O> {
  protected constructor(protected readonly dataSource: DataSource) {}

  abstract doLogic(input: I, manager: EntityManager): Promise<O>;

  public async execute(command: I) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const res = await this.doLogic(command, queryRunner.manager);
      await queryRunner.commitTransaction();
      return res;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
//Этот код определяет абстрактный базовый класс TransactionBaseUseCase, который обеспечивает выполнение.use case с поддержкой транзакций, используя TypeORM.
// Вот что делает код:
// Конструктор принимает экземпляр DataSource в качестве параметра, который представляет собой соединение с базой данных в TypeORM.
// Экземпляр dataSource сохраняется как защищенное свойство, делая его доступным для подклассов.

// Абстрактный метод doLogic
// Метод doLogic - это абстрактный метод, который должен быть реализован подклассами. Он принимает два параметра:
// input: Входные данные для use case
// manager: Экземпляр EntityManager, который используется для выполнения операций с базой данных в рамках транзакции

// Метод возвращает promise, который разрешается в выходные данные use case.
// Метод execute
// Метод execute - это точка входа для выполнения use case. Он принимает один параметр command, который является входными данными для use case.
// Вот что делает метод execute:
// Создает экземпляр QueryRunner из dataSource. QueryRunner - это концепция TypeORM, которая управляет соединением с базой данных и предоставляет методы для выполнения запросов и транзакций.
// Подключается к базе данных с помощью метода createQueryRunner().connect().
// Начинает транзакцию с помощью метода startTransaction().
// Вызывает метод doLogic, передавая параметры command и manager свойства QueryRunner. Свойство manager - это экземпляр EntityManager, который используется для выполнения операций с базой данных в рамках транзакции.

// Если метод doLogic завершается успешно, фиксирует транзакцию с помощью метода commitTransaction().
// Если происходит ошибка во время выполнения метода doLogic, откатывает транзакцию с помощью метода rollbackTransaction() и повторно выбрасывает ошибку.
// Наконец, освобождает экземпляр QueryRunner с помощью метода release(), независимо от того, была ли транзакция зафиксирована или отменена.
// Благодаря этому абстрактному базовому классу, подклассы могут реализовать свой собственный метод doLogic и унаследовать поведение транзакций, обеспечиваемое методом execute.
// Это гарантирует, что операции с базой данных выполняются в рамках транзакции, что обеспечивает атомарность и согласованность.
