import { IsStringLength } from '../../../../../common/decorators/validate/is.string.length';

export class CommentUpdateInputModel {
  @IsStringLength(20, 300)
  content: string;
}
