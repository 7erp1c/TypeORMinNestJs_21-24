import bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BcryptAdapter {
  async createHash(string: string) {
    return await bcrypt.hash(string, 10);
  }

  async compareHash(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }
}
