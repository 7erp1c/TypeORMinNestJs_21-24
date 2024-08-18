import { IsStringLength } from '../../../../../../common/decorators/validate/is.string.length';
import { IsArray, IsBoolean, IsIn, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Question } from '../../../domain/quiz.question.entity';
import { createQuizQuestion } from '../type.question';

export class createQuestion {
  @IsStringLength(10, 500)
  body: string;
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  correctAnswers: string[];
}

export class updateQuestion extends createQuestion {}

export class updateQuestionPublish {
  @IsIn([true, false])
  @IsBoolean()
  published: boolean;
}
