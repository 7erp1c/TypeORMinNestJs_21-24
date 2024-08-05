import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSettings } from './settings/app-settings';
import { applyAppSettings } from './settings/apply-app-setting';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  applyAppSettings(app);

  await app.listen(appSettings.api.APP_PORT, () => {
    console.log('App starting listen port: ', appSettings.api.APP_PORT);
    console.log('ENV: ', appSettings.env.getEnv());
  });
}

bootstrap();
