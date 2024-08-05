import { applyDecorators } from '@nestjs/common';
import { Trim } from '../transform/trim';
import { IsNotEmpty, IsString } from 'class-validator';

export const IsOptionalString = () => {
  return applyDecorators(Trim(), IsString(), IsNotEmpty());
};
