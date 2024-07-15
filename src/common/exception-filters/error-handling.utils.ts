// response.interface.ts
export interface BadRes<T> {
  success: boolean;
  data?: T;
  error?: {
    status: string;
    errorsMessages: {
      message: string;
      field: string;
    }[];
  };
}

export function createBadRequestException(field: string, message: string) {
  return {
    status: 'fail',
    errorsMessages: [
      {
        message: message,
        field: field,
      },
    ],
  };
}
