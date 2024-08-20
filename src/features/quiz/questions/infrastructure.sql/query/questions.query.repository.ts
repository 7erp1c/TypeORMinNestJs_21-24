import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../../domain/quiz.question.entity';
import { Repository } from 'typeorm';
import { quizQuestion } from '../../api/model/type.question';
import {
  QuerySearchType,
  QuerySortType,
} from '../../../../../base/adapters/query/types';

@Injectable()
export class QuestionsQueryRepository {
  constructor(
    @InjectRepository(Question)
    private readonly question: Repository<Question>,
  ) {}

  async getAll(sortData: QuerySortType, searchData: QuerySearchType) {
    // Сортировка
    const sortDefault = {
      default: `"createdAt"`,
    };
    const sortKey = `"${sortData.sortBy}"` || sortDefault.default;
    const sortDirection = sortData.sortDirection === 'asc' ? `ASC` : `DESC`;

    // Параметры пагинации 👀
    const pageNumber = sortData.pageNumber || 1;
    const pageSize = sortData.pageSize || 10;
    const offset = (pageNumber - 1) * pageSize;

    //Начало Query_Builderо4ка
    const query = this.question
      .createQueryBuilder('q')
      .select([
        'q.id',
        'q.body',
        'q.correctAnswers',
        'q.published',
        'q.createdAt',
        'q.updatedAt',
      ]);

    // Поиск по body_Search_Term, если он передан
    if (searchData.bodySearchTerm) {
      query.andWhere('q.body LIKE :bodySearchTerm', {
        bodySearchTerm: `%${searchData.bodySearchTerm}%`,
      });
    }

    // Фильтрация по published_Status
    if (searchData.publishedStatus === 'published') {
      query.andWhere('q.published = :published', { published: true });
    } else if (searchData.publishedStatus === 'notPublished') {
      query.andWhere('q.published = :published', { published: false });
    }

    // Добавляем сортировку на основе sortData
    if (sortData && sortData.sortBy) {
      query.orderBy(`q.${sortKey}`, sortDirection);
    }
    // Добавляем пагинацию (LIMIT и OFFSET)
    query.limit(pageSize).offset(offset);

    // Выполнение запроса и получение результатов
    const [questions, count] = await query.getManyAndCount();

    const response = {
      pagesCount: Math.ceil(count / +sortData.pageSize),
      page: +sortData.pageNumber,
      pageSize: +sortData.pageSize,
      totalCount: count,
      items: questions,
    };

    // Возвращаем ответ
    return response;
  }

  //____________________________________________________________________________
  async getById(id: string) {
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
        .where('id = :id', { id });
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

  async findRandomQuestions(): Promise<Question[]> {
    return await this.question
      .createQueryBuilder('q')
      .where('q.published = true')
      .orderBy('RANDOM()')
      .take(5)
      .getMany();
  }
}
