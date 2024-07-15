import { Injectable } from '@nestjs/common';
import {
  CreatePostInputModels,
  PostForBlog,
  UpdatePostInputModel,
} from '../api/models/input/create.post.input.models';
import { Post } from '../domain/posts.entity';
import { PostsRepository } from '../infrastructure/posts.repository';
import { DateCreate } from '../../../../base/adapters/get-current-date';
import { PostsRepositorySql } from '../infrastructure.sql/posts.repository.sql';

@Injectable()
export class PostsService {
  constructor(
    protected readonly dateCreate: DateCreate,
    protected readonly postsRepository: PostsRepository,
    protected readonly postsRepositorySql: PostsRepositorySql,
  ) {}

  async createPost(inputModel: CreatePostInputModels, blogName: string) {
    const createdAt = await this.dateCreate.getCurrentDateInISOStringFormat();
    const newPosts: Post = {
      title: inputModel.title,
      shortDescription: inputModel.shortDescription,
      content: inputModel.content,
      blogId: inputModel.blogId,
      blogName: blogName,
      createdAt: createdAt,
    };
    //const newPostId = this.postsRepository.createPost(newPosts);//mongoose
    const newPostId = this.postsRepositorySql.createPost(newPosts);
    return newPostId;
  }

  async updatePostForBlog(
    blogId: string,
    postId: string,
    inputModel: PostForBlog,
  ) {
    return await this.postsRepositorySql.updatePostForBlog(
      blogId,
      postId,
      inputModel,
    );
  }

  async deletePostForBlog(blogId: string, postId: string) {
    return await this.postsRepositorySql.deletePostForBlog(blogId, postId);
  }

  async updateBlog(postId: string, postUpdateDto: UpdatePostInputModel) {
    return await this.postsRepository.updatePost(postId, postUpdateDto);
  }

  async deletePost(postId: string) {
    return await this.postsRepository.deletePost(postId);
  }

  async findPostById(id: string) {
    return await this.postsRepository.findPostById(id);
  }
}
