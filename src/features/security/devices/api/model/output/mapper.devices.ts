import { SessionOutput } from './output';
import { Session } from '../../../domain/device.entity';

export const sessionMapper = (session: Session): SessionOutput => {
  return {
    ip: session.ip,
    title: session.deviceTitle,
    lastActiveDate: session.lastActiveDate,
    deviceId: session.deviceId,
  };
};
