import {
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'Questions' })
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  body: string;
  @Column('text', { array: true, nullable: false })
  correctAnswers: string[];
  @Column('boolean', { nullable: false, default: false })
  published: boolean;
  @Column()
  createdAt: string;
  @Column()
  updatedAt: string;

  @DeleteDateColumn()
  public deletedAt: Date;
  // @Column('boolean', { default: false })
  // isDeleted: boolean;
}
