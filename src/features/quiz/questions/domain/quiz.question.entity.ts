import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Game } from '../../game/domain/game.entity';
import { Answer } from '../../game/domain/answers.on.questions.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', width: 500 })
  body: string;

  @Column({ type: 'jsonb', default: [] })
  correctAnswers: string[];

  @Column({ type: 'boolean', default: false })
  published: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  updatedAt: Date | null;

  //in Answer
  @OneToMany(() => Answer, (answer) => answer.question, {
    onDelete: 'CASCADE',
  })
  answers: Answer[];

  //in game
  @ManyToMany(() => Game, (game) => game.questions, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  games: Game[];

  @DeleteDateColumn()
  public deletedAt: Date;
}
