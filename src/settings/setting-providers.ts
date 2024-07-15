// import { Provider } from '@nestjs/common';
// import { AuthService } from '../features/auth/aplication/auth.service';
// import { JwtService } from '@nestjs/jwt';
// import { TokenService } from '../common/service/jwt/token.service';
// import { BlogsRepository } from '../features/blogs/infrastructure/blogs.repository';
// import { BlogsService } from '../features/blogs/aplication/blogs.service';
// import { BlogsQueryRepository } from '../features/blogs/infrastructure/blogs.query-repository';
// import { PostsRepository } from '../features/posts/infrastructure/posts.repository';
// import { PostsService } from '../features/posts/aplication/posts.service';
// import { PostsQueryRepository } from '../features/posts/infrastructure/posts.query-repository';
// import { UsersRepository } from '../features/users/infrastructure/users.repository';
// import { UsersService } from '../features/users/application/users.service';
// import { UsersQueryRepository } from '../features/users/infrastructure/users.query-repository';
// import { TestingService } from '../features/testing/aplication/testing.service';
// import { TestingRepository } from '../features/testing/infrastructure/testing.repository';
// import { BcryptAdapter } from '../base/adapters/bcrypt.adapter';
// import { DateCreate } from '../base/adapters/get-current-date';
// import { PostsLikesQueryRepository } from '../features/likes/infrastructure/posts.likes.query.repository';
// import { EmailAdapter } from '../common/service/email/email-adapter';
// import { EmailsManager } from '../common/service/email/email-manager';
// import { AuthGuard } from '../common/guards/auth.guard';
// import { CommentsQueryRepository } from '../features/comments/infrastructure/comments.query.repository';
// import { CommentsLikesQueryRepository } from '../features/likes/infrastructure/comments.likes.query.repository';
// import { CommentsService } from '../features/comments/aplication/comments.service';
// import { CommentsController } from '../features/comments/api/comments.controller';
// import { CommentsRepository } from '../features/comments/infrastructure/comments.repository';
// import { LikesPostService } from '../features/likes/aplication/likes.post.service';
// import { PostLikesRepository } from '../features/likes/infrastructure/post.likes.repository';
// import { LikesCommentsService } from '../features/likes/aplication/likes.comments.service';
// import { CommentsLikesRepository } from '../features/likes/infrastructure/comments.likes.repository';
// import { DevicesController } from '../features/devices/api/devices.controller';
// import { DevicesService } from '../features/devices/aplication/devices.service';
// import { DeviceRepository } from '../features/devices/infrastructure/device.repository';
// import { AuthModule } from '../features/auth/module/auth.module';
// import { SessionsQueryRepository } from '../features/devices/infrastructure/device.query.repository';
//
// export const authProviders: Provider[] = [AuthService, AuthGuard];
// export const devicesProviders: Provider[] = [
//   DevicesService,
//   DeviceRepository,
//   SessionsQueryRepository,
// ];
// export const JWTProviders: Provider[] = [JwtService, TokenService];
// export const blogsProviders: Provider[] = [
//   BlogsRepository,
//   BlogsService,
//   BlogsQueryRepository,
// ];
// export const postsProviders: Provider[] = [
//   PostsRepository,
//   PostsService,
//   PostsQueryRepository,
// ];
// export const usersProviders: Provider[] = [
//   UsersRepository,
//   UsersService,
//   UsersQueryRepository,
// ];
// export const testingProvider: Provider[] = [TestingService, TestingRepository];
// export const commonsProvider: Provider[] = [BcryptAdapter, DateCreate];
// export const likesProviders: Provider[] = [
//   LikesPostService,
//   LikesCommentsService,
//   CommentsLikesRepository,
//   PostLikesRepository,
//   PostsLikesQueryRepository,
//   CommentsLikesQueryRepository,
// ];
// export const emailProviders: Provider[] = [EmailAdapter, EmailsManager];
// export const commentsProviders: Provider[] = [
//   CommentsController,
//   CommentsService,
//   CommentsRepository,
//   CommentsQueryRepository,
// ];
