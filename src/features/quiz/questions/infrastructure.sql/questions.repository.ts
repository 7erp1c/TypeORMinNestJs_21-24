import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../domain/quiz.question.entity';
import { createQuizQuestion } from '../api/model/type.question';
import { Repository } from 'typeorm';
import { DeleteQuestionUseCase } from '../aplication.use.case/delete.question.use.case';
import {
  updateQuestion,
  updateQuestionPublish,
} from '../api/model/input/input.questions';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questions: Repository<Question>,
  ) {}

  async createQuestion(inputModel: createQuizQuestion) {
    try {
      const savedUser = await this.questions.save(inputModel);
      return savedUser.id.toString();
    } catch (e) {
      throw new NotFoundException(e);
    }
  }

  async deleteQuestion(id: string) {
    try {
      const result = await this.questions
        .createQueryBuilder()
        .softDelete()
        .where('id = :id', { id })
        .execute();
      if (result.affected === 0)
        throw new NotFoundException('Question not found');
      return result;
    } catch (e) {
      throw e;
    }
  }
  async updateDataQuestion(id: string, inputModel: updateQuestion) {
    const logger = new Logger('QuestionsService');
    const date = new Date();
    try {
      const result = await this.questions
        .createQueryBuilder()
        .update(Question)
        .set({
          body: inputModel.body,
          correctAnswers: inputModel.correctAnswers,
          updatedAt: date,
        })
        .where('id = :id', { id })
        //.returning('id')
        .execute();
      if (result.affected === 0) {
        logger.warn(`Update failed: Question with ID ${id} not found`);
        throw new NotFoundException('Question not found');
      }

      logger.log(`Question with ID ${id} successfully updated`);
      return result;
    } catch (e) {
      logger.error(`Failed to update Question with ID ${id}`, e.stack);
      throw e;
    }
  }

  async updatePublishQuestion(id: string, inputModel: updateQuestionPublish) {
    const date = new Date();
    try {
      const result = await this.questions
        .createQueryBuilder()
        .update(Question)
        .set({
          published: inputModel.published,
          updatedAt: date,
        })
        .where('id = :id', { id })
        //.returning('id')
        .execute();
      if (result.affected === 0)
        throw new NotFoundException('Question not found');
      return result;
    } catch (e) {
      throw e;
    }
  }
}
