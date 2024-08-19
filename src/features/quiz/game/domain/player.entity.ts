import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  OneToOne,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';

import { Game } from './game.entity';
import { Users } from '../../../users/domain/user.entities.typeORM';
import { Answer } from './answers.on.questions.entity';

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0 })
  score: number;

  //in User
  @ManyToOne(() => Users, {
    onDelete: 'CASCADE',
  })
  user: Users;
  //in Game
  @OneToOne(() => Game)
  game: Game;
  //in Answer
  @OneToMany(() => Answer, (answer) => answer.player, {
    onDelete: 'CASCADE',
  })
  answers: Answer[];

  @DeleteDateColumn()
  public deletedAt: Date;
}
