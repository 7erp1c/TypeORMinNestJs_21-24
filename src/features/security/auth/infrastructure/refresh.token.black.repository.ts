import { InjectModel } from '@nestjs/mongoose';
import { RefreshTokenBlackList } from '../domain/refresh.token.black.list.entity';
import { Model } from 'mongoose';

export class RefreshTokenBlackRepository {
  constructor(
    @InjectModel(RefreshTokenBlackList.name)
    protected refreshTokenBlackListModel: Model<RefreshTokenBlackList>,
  ) {}

  async addToBlackList(token: string) {
    try {
      await this.refreshTokenBlackListModel.create({ refreshToken: token });
      return true;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findInBlackList(token: string) {
    try {
      const isInBlackList = await this.refreshTokenBlackListModel
        .findOne({ refreshToken: token })
        .lean();
      console.log('blackList', isInBlackList);
      return isInBlackList?.refreshToken;
    } catch (error) {
      throw new Error(error);
    }
  }
}
