import { IsUUID } from 'class-validator';

export class InputUuid {
  @IsUUID('4')
  id: string;
}
