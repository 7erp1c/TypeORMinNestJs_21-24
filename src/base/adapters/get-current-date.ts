import { Injectable } from '@nestjs/common';
import { add } from 'date-fns';

@Injectable()
export class DateCreate {
  async getCurrentDateInISOStringFormat() {
    const currentDate = new Date();
    return currentDate.toISOString();
  }
  async getDateInISOStringFormat() {
    const currentDate = add(new Date(), { hours: 48 });
    return currentDate.toISOString();
  }
}
