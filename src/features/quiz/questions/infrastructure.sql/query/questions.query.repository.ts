import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../../domain/quiz.question.entity';
import { Repository } from 'typeorm';
import { quizQuestion } from '../../api/model/type.question';

@Injectable()
export class QuestionsQueryRepository {
  constructor(
    @InjectRepository(Question) private readonly question: Repository<Question>,
  ) {}

  async getById(id: string): Promise<quizQuestion> {
    console.log('questionId: ', id);
    try {
      const query = await this.question
        .createQueryBuilder('q')
        .select([
          'q.id',
          'q.body',
          'q.correctAnswers',
          'q.published',
          'q.createdAt',
          'q.updatedAt',
        ])
        .where('id = :id', { id })
        .andWhere('q.isDeleted = false');
      console.log('Query:', query.getSql());
      const result = await query.getOne();
      if (!result) throw new NotFoundException();
      const mapQuestion: quizQuestion = {
        id: result.id,
        body: result.body,
        correctAnswers: result.correctAnswers,
        published: result.published,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };

      return mapQuestion;
    } catch (e) {
      throw new NotFoundException(e);
    }
  }
}
