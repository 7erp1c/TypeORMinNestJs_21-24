import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Error, Model } from 'mongoose';
import { User, UserDocument } from '../domain/user.entity';
import { CreateUserDto, UserOutputDto } from '../api/models/output/output';
import { ObjectId } from 'mongodb';
import { appSettings } from '../../../settings/app-settings';
import { LoginOrEmailInputModel } from '../../security/auth/api/model/input/loginOrEmailInputModel';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async updateConfirmationStatus(code: string, date: string) {
    try {
      const isUpdated = await this.userModel.updateOne(
        { 'emailConfirmation.confirmationCode': code },
        {
          $set: {
            'emailConfirmation.expirationDate': date,
            'emailConfirmation.isConfirmed': true,
          },
        },
      );
      return isUpdated.matchedCount === 1;
    } catch (err) {
      return new Error('Not update emailConfirmation');
    }
  }

  async updateUserConfirmationAccount(
    email: string,
    code: string,
    date: string,
  ) {
    try {
      const isUpdated = await this.userModel.updateOne(
        { email: email },
        {
          $set: {
            'emailConfirmation.confirmationCode': code,
            'emailConfirmation.expirationDate': date,
            'emailConfirmation.isConfirmed': false,
          },
        },
      );
      return isUpdated.matchedCount === 1;
    } catch (err) {
      return new Error('Not update emailConfirmation');
    }
  }
  async updatePassword(code: string, hash: string, date: string) {
    try {
      const isUpdated = await this.userModel.updateOne(
        { 'recoveryPassword.recoveryCode': code },
        {
          $set: {
            hash: hash,
            'recoveryPassword.expirationDate': date,
            'recoveryPassword.isUsed': true,
          },
        },
      );
      return isUpdated.matchedCount === 1;
    } catch (err) {
      return new Error('Not update recoveryPassword');
    }
  }

  async updateRecovery(email: string, code: string, date: string) {
    try {
      const isUpdated = await this.userModel.updateOne(
        { email: email },
        {
          $set: {
            'recoveryPassword.recoveryCode': code,
            'recoveryPassword.expirationDate': date,
            'recoveryPassword.isUsed': false,
          },
        },
      );
      return isUpdated.matchedCount === 1;
    } catch (err) {
      return new Error('Not update recoveryPassword');
    }
  }
  async createUser(newUserDto: CreateUserDto | User) {
    const createUser = new this.userModel(newUserDto);
    const savedUser = await createUser.save();
    const user: UserOutputDto = {
      id: savedUser._id.toString(),
      login: savedUser.login,
      email: savedUser.email,
      createdAt: savedUser.createdAt,
    };
    return user;
  }

  async deleteUser(id: string) {
    try {
      const result = await this.userModel
        .findOneAndDelete({
          _id: new ObjectId(id),
        })
        .exec();
      if (!result) throw new NotFoundException('User not found');
      return result;
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  async getUserById(id: string) {
    try {
      return await this.userModel.findOne({ _id: new ObjectId(id) }).lean();
    } catch {
      throw new NotFoundException(
        `status: ${HttpStatus.NOT_FOUND}, Method: *, field: getUserById, ${appSettings.api.UserError}`,
      );
    }
  }
  async getUserByEmail(email: string) {
    try {
      const result = await this.userModel.findOne({ email: email }).lean();
      if (!result) throw new BadRequestException();
      return result;
    } catch {
      throw new BadRequestException([
        {
          message: 'email missing in Db',
          field: 'email',
        },
      ]);
    }
  }
  async getUserByCode(code: string) {
    try {
      const result = await this.userModel
        .findOne({
          $or: [
            { 'recoveryPassword.recoveryCode': code },
            { 'emailConfirmation.confirmationCode': code },
          ],
        })
        .lean();
      if (!result)
        throw new BadRequestException([
          {
            message: 'code already exist',
            field: 'code',
          },
        ]);
      return result;
    } catch {
      throw new BadRequestException([
        {
          message: 'code already exist',
          field: 'code',
        },
      ]);
    }
  }

  public async insert(user: User) {
    const result: UserDocument[] = await this.userModel.insertMany(user);
    return result[0];
  }
  //проверка уникальности:
  public async valueIsExist(keys: string, value: string) {
    const dynamicKey = { [keys]: value };
    const result = await this.userModel.countDocuments(dynamicKey);
    return result > 0;
  }

  async getUserByLoginOrEmail(InputModel: LoginOrEmailInputModel) {
    const result = await this.userModel
      .findOne({
        $or: [
          { email: InputModel.loginOrEmail },
          { login: InputModel.loginOrEmail },
        ],
      })
      .lean();
    if (!result)
      throw new UnauthorizedException([
        {
          field: 'code',
          message: 'code already exist',
        },
      ]);
    return result;
  }
}
