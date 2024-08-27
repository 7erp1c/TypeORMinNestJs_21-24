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
            .where('qp.userId = :userId', { userId });
        }, 'sumScore')

        // Подсчет среднего количества очков
        .addSelect((query) => {
          return query
            .select(
              'CASE WHEN AVG(qp.score) % 1 = 0 THEN CAST(AVG(qp.score) AS INTEGER) ELSE ROUND(AVG(qp.score), 2) END',
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
            .where('po.userId = :userId OR pt.userId = :userId', { userId });
        }, 'gamesCount')

        // Подсчет побед
        .addSelect((query) => {
          return query
            .select('count(*)')
            .from(Game, 'g')
            .leftJoin('g.playerOne', 'po')
            .leftJoin('g.playerTwo', 'pt')
            .where('po.userId = :userId OR pt.userId = :userId', { userId })
            .andWhere(
              '(po.userId = :userId and po.score > pt.score or pt.userId = :userId and pt.score > po.score)',
              { userId },
            );
        }, 'winsCount')

        // Подсчет поражений
        .addSelect((query) => {
          return query
            .select('count(*)')
            .from(Game, 'g')
            .leftJoin('g.playerOne', 'po')
            .leftJoin('g.playerTwo', 'pt')
            .where('po.userId = :userId OR pt.userId = :userId', { userId })
            .andWhere(
              '(po.userId = :userId and po.score < pt.score or pt.userId = :userId and pt.score < po.score)',
              { userId },
            );
        }, 'lossesCount')

        // Подсчет ничьих
        .addSelect((query) => {
          return query
            .select('count(*)')
            .from(Game, 'g')
            .leftJoin('g.playerOne', 'po')
            .leftJoin('g.playerTwo', 'pt')
            .where('po.userId = :userId OR pt.userId = :userId', { userId })
            .andWhere(
              '(po.userId = :userId and po.score = pt.score or pt.userId = :userId and pt.score = po.score)',
              { userId },
            );
        }, 'drawsCount')

        .leftJoin('p.user', 'u')
        .where('u.id = :userId', { userId })
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
