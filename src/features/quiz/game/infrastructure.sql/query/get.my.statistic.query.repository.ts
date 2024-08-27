import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import { Game } from '../../domain/game.entity';
import { Player } from '../../domain/player.entity';
import { MyStatisticViewModel } from '../../api/model/output/output.statistic/output.statistic';
import { InjectRepository } from '@nestjs/typeorm';

export class MyStatisticQuery {
  constructor(
    private readonly manager: EntityManager,
    @InjectRepository(Player)
    private readonly playersRepository: Repository<Player>,
  ) {}

  async getPlayerStatistic(userId: string): Promise<MyStatisticViewModel> {
    try {
      const result = await this.playersRepository
        .createQueryBuilder('p') //почему не работал с EntityManager
        .select('p.id', 'p_id')
        .addSelect('p.user', 'u_id')

        // Подсчет суммы очков
        .addSelect((query) => {
          return query
            .select('SUM(qp.score)')
            .from(Player, 'qp')
            .where(`qp.userId = :userId`, { userId });
        }, 'sumScore')

        // Подсчет среднего количества очков
        .addSelect((query) => {
          return query
            .select(
              `CASE WHEN AVG(qp.score) % 1 = 0 THEN CAST(AVG(qp.score) AS INTEGER) ELSE ROUND(AVG(qp.score), 2) END`,
              // CASE WHEN AVG(qp.score) % 1 = 0: Если среднее значение AVG(qp.score) не имеет дробной части (т.е. это целое число), тогда:
              // CAST(AVG(qp.score) AS INTEGER): Преобразуем значение в целое число.
              // ELSE ROUND(AVG(qp.score), 2): Если среднее значение имеет дробную часть, тогда:
              // ROUND(AVG(qp.score), 2): Округляем значение до двух знаков после запятой.
            )
            .from(Player, 'qp')
            .where('qp.userId = :userId', { userId });
        }, 'avgScores')

        // Подсчет количества игр
        .addSelect((query) => {
          return query
            .select('COUNT(*)')
            .from(Game, 'g')
            .leftJoin('g.playerOne', 'po')
            .leftJoin('g.playerTwo', 'pt')
            .where(`po.userId = :userId OR pt.userId = :userId`, { userId });
        }, 'gamesCount')

        // Подсчет побед
        .addSelect((query) => {
          return query
            .select(
              'count(CASE WHEN (po.userId = :userId AND po.score > pt.score) OR (pt.userId = :userId AND pt.score > po.score) THEN 1 ELSE NULL END)',
            )
            .from(Game, 'g')
            .leftJoin('g.playerOne', 'po')
            .leftJoin('g.playerTwo', 'pt')
            .where('po.userId = :userId OR pt.userId = :userId', { userId });
        }, 'winsCount')

        // Подсчет поражений
        .addSelect((query) => {
          return query
            .select(
              'count(CASE WHEN (po.userId = :userId AND po.score < pt.score) OR (pt.userId = :userId AND pt.score < po.score) THEN 1 ELSE NULL END)',
            )
            .from(Game, 'g')
            .leftJoin('g.playerOne', 'po')
            .leftJoin('g.playerTwo', 'pt');
        }, 'lossesCount')

        // Подсчет ничьих
        .addSelect((query) => {
          return query
            .select(
              `count(CASE WHEN ( po.score = pt.score) OR ( pt.score = po.score) THEN 1 ELSE NULL END)`,
              'drawsCount',
            )
            .from(Game, 'g')
            .leftJoin('g.playerOne', 'po')
            .leftJoin('g.playerTwo', 'pt')
            .where('po.userId = :userId or pt.userId = :userId', { userId });
        }, 'drawsCount')

        .leftJoin('p.user', 'u')
        .where(`u.id = :userId`, { userId })
        .limit(1);

      console.log(result.getSql());
      // const stats = await query;
      const statistic = await result.getRawOne();
      return {
        sumScore: +statistic.sumScore,
        avgScores: +statistic.avgScores,
        gamesCount: +statistic.gamesCount,
        winsCount: +statistic.winsCount,
        lossesCount: +statistic.lossesCount,
        drawsCount: +statistic.drawsCount,
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
