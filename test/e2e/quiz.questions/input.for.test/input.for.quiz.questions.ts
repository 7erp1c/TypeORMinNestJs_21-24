import { UserCreateInputModel } from '../../../../src/features/users/api/models/input/create.user.input.model';
import { LoginOrEmailInputModel } from '../../../../src/features/security/auth/api/model/input/loginOrEmailInputModel';

export const createModel1: UserCreateInputModel = {
  login: 'I14fg7ada',
  password: 'qwerty123a',
  email: 'ul_tray@bk.rua',
};
export const loginModel1: LoginOrEmailInputModel = {
  loginOrEmail: 'ul_tray@bk.rua',
  password: 'qwerty123a',
};

export const createModel2: UserCreateInputModel = {
  login: 'I14fg7adu',
  password: 'qwerty1233u',
  email: 'ul_tray@bk.ruu',
};
export const loginModel2: LoginOrEmailInputModel = {
  loginOrEmail: 'ul_tray@bk.ruu',
  password: 'qwerty1233u',
};

export const inputModelCorrect = { answer: 'correct answer' };
export const inputModelIncorrect = { answer: 'incorrect' };
