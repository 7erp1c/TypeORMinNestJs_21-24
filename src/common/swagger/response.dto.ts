import { HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { APIErrorResult } from './out.type';

export const BadRequestResponse = ApiResponse({
  status: HttpStatus.BAD_REQUEST,
  description: 'If the inputModel has incorrect values.',
  type: APIErrorResult,
});

export const TooManyRequestsResponse = ApiResponse({
  status: HttpStatus.TOO_MANY_REQUESTS,
  description: 'More than 5 attempts from one IP-address during 10 seconds.',
});

export const NoContentResponse = ApiResponse({
  status: HttpStatus.NO_CONTENT,
  description:
    'Input data is accepted.Email with confirmation code will be send to passed email address.Confirmation code should be inside link as query param, for example: https://some-front.com/confirm-registration?code=youtcodehere.',
});
