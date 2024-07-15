import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentsDb } from '../domain/comments.entity';
import { ObjectId } from 'mongodb';
import { CommentUpdateInputModel } from '../api/input/comments.input.model';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(CommentsDb.name)
    private readonly commentModel: Model<CommentsDb>,
  ) {}
  async updateComment(id: string, inputModel: CommentUpdateInputModel) {
    try {
      const result = await this.commentModel.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: { content: inputModel.content },
        },
      );
      if (!result) throw new NotFoundException('Post not found');
    } catch {
      throw new NotFoundException('Post not found');
    }
  }

  async getCommentById(id) {
    try {
      const result = await this.commentModel
        .findOne({
          _id: new ObjectId(id),
        })
        .exec();
      if (!result) throw new NotFoundException('Comment not found');
      return result;
    } catch (error) {
      throw new NotFoundException('Comment not found');
    }
  }
  async createComment(commentDto: CommentsDb): Promise<string> {
    const newComment = await this.commentModel.create(commentDto);
    return newComment._id.toString();
  }

  async deleteComments(id: string) {
    try {
      const result = await this.commentModel
        .findOneAndDelete({
          _id: new ObjectId(id),
        })
        .exec();
      if (!result)
        throw new NotFoundException([
          {
            message: 'Comments not found',
            field: 'CommentsRepository.deleteComments',
          },
        ]);
      return result;
    } catch (error) {
      throw new NotFoundException([
        {
          message: 'Comments not found',
          field: 'CommentsRepository.deleteComments',
        },
      ]);
    }
  }
}
