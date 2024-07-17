import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Sessions' })
export class Session {
  @PrimaryGeneratedColumn('uuid')
  public id: string;
  @Column()
  public userId: string;
  @Column()
  public deviceId: string;
  @Column()
  public deviceTitle: string;
  @Column()
  public ip: string;
  @Column()
  public lastActiveDate: string;
  @Column()
  public createdAt: string;
  @Column()
  public expiredAt: string;
  @Column({
    default: false,
  })
  public isDeleted: boolean;
}
