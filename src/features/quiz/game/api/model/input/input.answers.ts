import { IsOptionalString } from '../../../../../../common/decorators/validate/is.optional.string';

export class AnswerPlayer {
  @IsOptionalString()
  answer: 'string';
}
