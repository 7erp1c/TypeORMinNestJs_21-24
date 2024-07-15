import { ApiProperty } from '@nestjs/swagger';
import { IsOptionalString } from '../../../../../../common/decorators/validate/is.optional.string';
import { IsOptionalEmail } from '../../../../../../common/decorators/validate/is.optional.email';
import { IsStringLength } from '../../../../../../common/decorators/validate/is.string.length';

export class LoginOrEmailInputModel {
  @ApiProperty({
    example: 'string',
    required: true,
  })
  @IsOptionalString()
  loginOrEmail: string;
  @ApiProperty({
    example: 'string',
    required: true,
  })
  @IsOptionalString()
  password: string;
}

export class UserEmailInputModel {
  @IsOptionalEmail()
  email: string;
}
export class NewPasswordInputModel {
  @IsStringLength(6, 20)
  password: string;

  @IsOptionalString()
  code: string;
}

export class ConfirmationCodeInputModel {
  @ApiProperty({
    example: 'code number',
    pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
    description: 'Code that be sent via Email inside link',
    required: true,
  })
  @IsOptionalString()
  code: string;
}
