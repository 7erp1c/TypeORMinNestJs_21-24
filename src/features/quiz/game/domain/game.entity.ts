import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToMany,
} from 'typeorm';
import { Player } from './player.entity';

import { GameStatuses } from '../../enums/game.statuses';
import { Question } from '../../questions/domain/quiz.question.entity';

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  status: GameStatuses;

  @CreateDateColumn({
    type: 'timestamp with time zone',
  })
  pairCreatedDate: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  startGameDate: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  finishGameDate: Date | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  expGameDate: Date;

  //in Player one
  @OneToOne(() => Player, (player) => player.game, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  playerOne: Player;
  //in Player two
  @OneToOne(() => Player, (player) => player.game, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  playerTwo: Player;
  //In Question
  @ManyToMany(() => Question, (question) => question.games, {
    onDelete: 'CASCADE',
  })
  questions: Question[];

  @DeleteDateColumn()
  public deletedAt: Date;
}
