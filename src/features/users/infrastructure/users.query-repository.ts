import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  QuerySearchType,
  QuerySortType,
} from '../../../base/adapters/query/types';
import { UserType } from '../api/models/output/output';
import { WithId } from 'mongodb';
import { UserOutputModelMapper } from '../api/models/output/user.output.model';
import { getAuthTypeEndpointMe } from '../../security/auth/api/model/output/output';

export const SORT = {
  asc: 1,
  desc: -1,
};
// export abstract class BaseQueryRepository<M> {
//     protected constructor(private models: Model<M>) {
//     }
//
//     async find(filter: FilterQuery<M>,
//                projection?: ProjectionType<M> | null | undefined,
//                options?: QueryOptions<M> | null | undefined,
//                pagination: {skip: number, limit: number }) {
//         return this.models.find<M>(filter, projection, options)
//     }
// }

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  async getAllUsers(sortData: QuerySortType, searchData: QuerySearchType) {
    let sortKey = {};
    let searchKey = {};

    // check have search terms create search keys array
    const searchKeysArray: any[] = [];
    if (searchData.searchLoginTerm)
      searchKeysArray.push({
        login: { $regex: searchData.searchLoginTerm, $options: 'i' },
      });
    if (searchData.searchEmailTerm)
      searchKeysArray.push({
        email: { $regex: searchData.searchEmailTerm, $options: 'i' },
      });

    if (searchKeysArray.length === 0) {
      searchKey = {};
    } else if (searchKeysArray.length === 1) {
      searchKey = searchKeysArray[0];
    } else if (searchKeysArray.length > 1) {
      searchKey = { $or: searchKeysArray };
    }
    // calculate limits for DB request
    const documentsTotalCount = await this.userModel.countDocuments(searchKey); // Receive total count of blogs
    const pageCount = Math.ceil(documentsTotalCount / +sortData.pageSize); // Calculate total pages count according to page size
    const skippedDocuments = (+sortData.pageNumber - 1) * +sortData.pageSize; // Calculate count of skipped docs before requested page

    // check have fields exists assign the same one else assign "createdAt" value
    if (sortData.sortBy === 'login')
      sortKey = { login: SORT[sortData.sortDirection] };
    else if (sortData.sortBy === 'email')
      sortKey = { email: SORT[sortData.sortDirection] };
    else sortKey = { createdAt: SORT[sortData.sortDirection] };

    // Get documents from DB
    const users: WithId<UserType>[] = await this.userModel
      .find(searchKey)
      .sort(sortKey)
      .skip(+skippedDocuments)
      .limit(+sortData.pageSize);

    return {
      pagesCount: pageCount,
      page: +sortData.pageNumber,
      pageSize: +sortData.pageSize,
      totalCount: documentsTotalCount,
      items: users.map(UserOutputModelMapper),
    };
  }
  // public async getById(userId: string): Promise<UserOutputModel> {
  //     const user = await this.userModel.findById(userId, {__v: false})
  //     return UserOutputModelMapper(user);
  // }
  async getUserAuthMe(id: string): Promise<getAuthTypeEndpointMe> {
    const user = await this.userModel.findById({ _id: id }).lean();
    if (!user) throw new UnauthorizedException('User not found');
    return {
      login: user.login,
      email: user.email,
      userId: user._id.toString(),
    };
  }
}
