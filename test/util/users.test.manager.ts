import { HttpStatus, INestApplication } from '@nestjs/common';
import { UserCreateInputModel } from '../../src/features/users/api/models/input/create.user.input.model';
import request from 'supertest';
import { expect } from '@jest/globals';
import { CommentsQueryRepository } from '../../src/features/blogs/comments/infrastructure/comments.query.repository';
import { PostsQueryRepository } from '../../src/features/blogs/posts/infrastructure/posts.query-repository';
import { BlogsQueryRepository } from '../../src/features/blogs/blogs/infrastructure/blogs.query-repository';
import { UsersQueryRepository } from '../../src/features/users/infrastructure/users.query-repository';

export class UsersTestManager {
  constructor(
    protected readonly app: INestApplication,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}
  // можно выносить некоторые проверки в отдельные методы для лучшей читаемости тестов
  expectCorrectModel(createModel: any, responseModel: any) {
    expect(createModel.name).toBe(responseModel.name);
    expect(createModel.email).toBe(responseModel.email);
    expect(createModel.lastName).toBe(responseModel.lastName);
  }
  async createUser(inputModelDto: UserCreateInputModel) {
    return request(this.app.getHttpServer())
      .post('sa/users')
      .send(inputModelDto)
      .expect(HttpStatus.NO_CONTENT);
  }

  async updateUser(adminAccessToken: string, updateModel: any) {
    return request(this.app.getHttpServer())
      .put('/users')
      .auth(adminAccessToken, {
        type: 'bearer',
      })
      .send(updateModel)
      .expect(204);
  }
}
