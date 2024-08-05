import { applyDecorators } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../transform/trim';

// Объединение декораторов
// https://docs.nestjs.com/custom-decorators#decorator-composition
export const IsOptionalEmail = () =>
  applyDecorators(Trim(), IsString(), IsNotEmpty(), IsEmail());
