import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../domain/quiz.question.entity';
import { createQuizQuestion } from '../api/model/type.question';
import { Repository } from 'typeorm';

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
}
