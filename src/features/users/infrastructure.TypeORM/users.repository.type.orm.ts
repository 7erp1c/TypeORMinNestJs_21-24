import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../domain/user.entities.typeORM';
import { Repository } from 'typeorm';
import { UserType } from '../api/models/output/output';
import { Injectable, NotFoundException } from '@nestjs/common';
@Injectable()
export class UsersRepositoryTypeOrm {
  constructor(
    @InjectRepository(Users) private readonly users: Repository<Users>,
  ) {}
  public async createUser(newUser: UserType) {
    try {
      const savedUser = await this.users.save(newUser);
      return savedUser.id.toString();
    } catch (e) {
      throw new NotFoundException(e);
    }
  }

  async deleteUser(id: string) {
    try {
      const result1 = await this.users
        .createQueryBuilder()
        .update('Users')
        .set({ isDeleted: true })
        .where('id = :id', { id })
        .execute();
      if (result1.affected === 0) throw new NotFoundException('User not found');
      await this.users
        .createQueryBuilder()
        .update('Users')
        .set({ isDeleted: true })
        .where('id = :id', { id })
        .execute();
      return result1;
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }
}
