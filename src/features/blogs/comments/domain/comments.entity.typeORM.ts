import { Prop, Schema } from '@nestjs/mongoose';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Comments')
export class Comments {
  @PrimaryGeneratedColumn('uuid')
  public id: string;
  @Column()
  content: string;
  @Column()
  postId: string;
  @Column()
  userId: string;
  @Column({
    collation: 'C',
  })
  userLogin: string;
  @Column()
  createdAt: string;
  @Column({ default: false })
  isDeleted: boolean;
}
