import { Post } from '../domain/posts.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { NotFoundException } from '@nestjs/common';
import { UpdatePostInputModel } from '../api/models/input/create.post.input.models';

export class PostsRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  async createPost(newPost: Post) {
    const create = await this.postModel.create(newPost);
    return create._id.toString();
  }

  async updatePost(id: string, postUpdateDto: UpdatePostInputModel) {
    try {
      const result = await this.postModel.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: postUpdateDto,
        },
      );
      if (!result) throw new NotFoundException('Post not found');
    } catch {
      throw new NotFoundException('Post not found');
    }
  }

  async deletePost(id: string) {
    try {
      const result = await this.postModel
        .findOneAndDelete({
          _id: new ObjectId(id),
        })
        .exec();
      if (!result) throw new NotFoundException('Post not found');
      return result;
    } catch (error) {
      throw new NotFoundException('Post not found');
    }
  }

  async findPostById(id: string) {
    try {
      const result = await this.postModel
        .findOne({
          _id: new ObjectId(id),
        })
        .exec();
      if (!result) throw new NotFoundException('Post not found');
      return result;
    } catch (error) {
      throw new NotFoundException('Post not found');
    }
  }
}
