import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  DeleteDateColumn,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Player } from './player.entity';
import { Question } from '../../questions/domain/quiz.question.entity';
import { AnswersStatuses } from '../../enums/answers.statuses';

@Entity('answers')
export class Answer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  answerStatus: AnswersStatuses;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  addedAt: Date;

  //in Player
  @ManyToOne(() => Player, (player) => player.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  player: Player;
  //in Question
  @OneToMany(() => Question, (question) => question.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  question: Question;

  @DeleteDateColumn()
  public deletedAt: Date;
}
