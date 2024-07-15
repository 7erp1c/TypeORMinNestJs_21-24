import { Matches } from 'class-validator';
import { IsStringLength } from '../../../../../common/decorators/validate/is.string.length';
import { IsOptionalEmail } from '../../../../../common/decorators/validate/is.optional.email';
import { UniqIsExist } from '../../../../../common/decorators/validate/uniqueness/uniqInDb-is-exist.decorator';

export class UserCreateInputModel {
  @IsStringLength(3, 10)
  @Matches('^[a-zA-Z0-9_-]*$')
  @UniqIsExist()
  login: string;
  @IsStringLength(6, 20)
  password: string;
  @IsOptionalEmail()
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  @UniqIsExist()
  email: string;
}
