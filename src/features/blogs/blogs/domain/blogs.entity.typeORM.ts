import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Blogs' })
export class Blogs {
  @PrimaryGeneratedColumn('uuid')
  public id: string;
  @Column({
    collation: 'C',
  })
  name: string;
  @Column()
  description: string;
  @Column()
  websiteUrl: string;
  @Column()
  createdAt: string;
  @Column()
  isMembership: boolean;
  @Column({ default: false })
  isDeleted: boolean;
}
