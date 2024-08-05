import * as process from 'process';
import { appSettings } from '../../../../settings/app-settings';

export const jwtConstants = {
  secret: appSettings.api.JWT_SECRET,
};
