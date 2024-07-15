import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'Users' })
export class Users {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({
    collation: 'C',
  })
  public login: string;

  @Column()
  public email: string;

  @Column()
  public hash: string;

  @Column()
  public createdAt: string;

  @Column()
  @Generated('uuid')
  public confirmationCode: string;

  @CreateDateColumn({ default: () => `'${new Date().toISOString()}'` })
  public expirationDate: string;

  @Column({
    default: false,
  })
  public isConfirmed: boolean;

  @Column()
  @Generated('uuid')
  public recoveryCode: string;

  @CreateDateColumn({ default: new Date().toISOString() })
  public recoveryExpirationDate: string;

  @Column({
    default: false,
  })
  public isUsed: boolean;

  @Column({
    default: false,
  })
  public isDeleted: boolean;
}
