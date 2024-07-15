import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
@Injectable()
export class FindsAll {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async findUserId(email: string) {
    console.log(email);
    const result = await this.dataSource.query(
      `
    SELECT * FROM public."Users"
    WHERE "email" = $1 
    `,
      [email],
    );
    console.log(result[0].id);
    return result[0].id;
  }
}
