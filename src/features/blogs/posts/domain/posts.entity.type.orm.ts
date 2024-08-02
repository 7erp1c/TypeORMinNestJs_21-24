import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Posts' })
export class Posts {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  title: string;
  @Column()
  shortDescription: string;
  @Column()
  content: string;
  @Column()
  blogId: string;
  @Column({
    collation: 'C',
  })
  blogName: string;
  @Column()
  createdAt: string;
  @Column({
    default: false,
  })
  isDeleted: boolean;
}
