import { testSeader } from '../e2e/utils/test.seader';
import mongoose from 'mongoose';
import { container } from '../../composition-root';
import { AuthService } from '../../domain/auth-service';
import { EmailsManager } from '../../domain/managers/email-manager';

// const authService = container.get<AuthService>(AuthService);
// const emailsManager = container.get<EmailsManager>(EmailsManager);
// describe('AuthTest-integration', () => {
//   const mongoURI = 'mongodb://0.0.0.0:27017/e2e_test';
//   beforeAll(async () => {
//     await mongoose.connect(mongoURI);
//     // const mongoServer = await MongoMemoryServer.create()
//     // await connectMongoDb.run(mongoServer.getUri())
//   });
//   beforeEach(async () => {
//     await mongoose.connection.dropDatabase();
//     // await connectMongoDb.drop()
//   });
//   afterAll(async () => {
//     await mongoose.connection.dropDatabase();
//     // await connectMongoDb.drop();
//     //await client.close();
//     // await connectMongoDb.stop(); если заюзали MongoMemoryServer
//   });
//   afterAll((done) => done()); //гарант качества окончания тестов😁
//   describe('User registration', () => {
//     const registerUserCase = authService.createUser; //проверяем создание User
//
//     //EmailsManager.sendMessageWitchConfirmationCode = emailServiceMock.sendMessageWitchConfirmationCode//мокаем отправку на мыло, в моке возвразаем true(используем если мы не профессионалы😂)
//     //EmailsManager.sendMessageWitchConfirmationCode = jest.fn() //  если функция должна отработать, ничего не передавая и не принимая
//     emailsManager.sendMessageWitchConfirmationCode = jest
//       .fn()
//       .mockImplementation((email: string, login: string, code: string) => {
//         return true;
//       });
//     // UsersQueryRepository.findUserByIdAllModel = jest.fn().mockImplementation((registerUserCase.id) =>{
//     //     return true
//     // })
//     it('should create user witch correct data', async () => {
//       const { login, password, email } = testSeader.createUserDto();
//
//       const result = await registerUserCase(login, password, email);
//
//       expect(result).toEqual({
//         id: expect.any(String),
//         login,
//         email,
//         createdAt: expect.any(String),
//       });
//       expect(emailsManager.sendMessageWitchConfirmationCode).toBeCalled(); //что метод был вызван
//       expect(emailsManager.sendMessageWitchConfirmationCode).toBeCalledTimes(1); //сколько раз вызван
//       // expect(UsersQueryRepository.findUserByIdAllModel).toBeCalled()//что метод был вызван
//       // expect(UsersQueryRepository.findUserByIdAllModel).toBeCalledTimes(1)//сколько раз вызван
//     });
//     it('should not register user twice ', async () => {
//       const { login, password, email } = testSeader.createUserDto();
//       await testSeader.registerUser({ login, password, email });
//
//       const result = await registerUserCase(login, password, email);
//
//       expect(result).toBe(null);
//     });
//   });
// });
