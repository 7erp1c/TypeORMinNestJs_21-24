import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CodeDto {
  @ApiProperty({
    example: 'code number',
    pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
    description: 'Code that be sent via Email inside link',
    required: true,
  })
  code: string;
}

export class LogInDto {
  @ApiProperty({
    example: 'string',
    required: true,
  })
  @IsOptional()
  @IsString()
  loginOrEmail: string;

  @ApiProperty({
    example: 'string',
    required: true,
  })
  @IsOptional()
  @IsString()
  password: string;
}
