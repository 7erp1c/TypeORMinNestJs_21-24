import { IsStringLength } from '../../../../../../common/decorators/validate/is.string.length';
import { IsArray, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class createQuestion {
  @IsStringLength(10, 500)
  body: string;
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  correctAnswers: string[];
}
