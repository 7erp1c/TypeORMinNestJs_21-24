import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Post } from '../domain/posts.entity';
import { PostForBlog } from '../api/models/input/create.post.input.models';

@Injectable()
export class PostsRepositorySql {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createPost(newPost: Post) {
    try {
      const create = await this.dataSource.query(
        `INSERT INTO "Posts"
                 ("title", "shortDescription", "content",
                 "blogId", "blogName", "createdAt")
            values($1,$2,$3,$4,$5,$6)
            RETURNING id`,
        [
          newPost.title,
          newPost.shortDescription,
          newPost.content,
          newPost.blogId,
          newPost.blogName,
          newPost.createdAt,
        ],
      );
      console.log('create[0].id;', create[0].id);

      return create[0].id;
    } catch (error) {
      throw new NotFoundException([
        {
          message: error,
          field: 'PostsRepository.createPostForBlog',
        },
      ]);
    }
  }

  async updatePostForBlog(
    blogId: string,
    postId: string,
    postUpdateDto: PostForBlog,
  ) {
    try {
      const result = await this.dataSource.query(
        `
        UPDATE public."Posts"
          SET "title" = $3, "content" = $4, "shortDescription" = $5
            WHERE "id" = $1
            AND "blogId" = $2
        `,
        [
          postId,
          blogId,
          postUpdateDto.title,
          postUpdateDto.content,
          postUpdateDto.shortDescription,
        ],
      );

      if (result[1] === 0) throw new NotFoundException('Post not found');
      return true;
    } catch {
      throw new NotFoundException('Post not found');
    }
  }
  //
  async deletePostForBlog(blogId: string, postId: string) {
    try {
      const deleteStatus = true;
      const isDelete = await this.dataSource.query(
        `
      UPDATE public."Posts"
      SET "isDeleted" = $2
      WHERE "id" = $1
      AND "blogId" = $3`,
        [postId, deleteStatus, blogId],
      );

      if (isDelete[1] === 0)
        throw new NotFoundException([
          { message: 'Blog not found', field: 'BlogsRepository.deleteBlog' },
        ]);
      return true;
    } catch (error) {
      throw new NotFoundException([
        { message: 'Blog not found', field: 'BlogsRepository.deleteBlog' },
      ]);
    }
  }
  //
  // async findPostById(id: string) {
  //   try {
  //     const result = await this.postModel
  //       .findOne({
  //         _id: new ObjectId(id),
  //       })
  //       .exec();
  //     if (!result) throw new NotFoundException('Post not found');
  //     return result;
  //   } catch (error) {
  //     throw new NotFoundException('Post not found');
  //   }
  // }
}
