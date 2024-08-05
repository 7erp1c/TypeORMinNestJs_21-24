import { ApiProperty } from '@nestjs/swagger';

class ErrorMessages {
  @ApiProperty({
    example: 'string',
    nullable: true,
    description: 'Message with error explanation for certain field',
  })
  message: string;

  @ApiProperty({ example: 'string' })
  field: string;
}

export class APIErrorResult {
  @ApiProperty({ type: [ErrorMessages] })
  errorsMessages: ErrorMessages[];
}
