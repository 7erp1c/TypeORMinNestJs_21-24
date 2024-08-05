export class SessionModel {
  userId: string;
  deviceId: string;
  deviceTitle: string;
  ip: string;
  lastActiveDate: string;
  refreshToken: {
    createdAt: string;
    expiredAt: string;
  };
}

export class SessionUpdateModel {
  lastActiveDate: string;
  refreshToken: {
    createdAt: string;
    expiredAt: string;
  };
}

export class SessionInputModel {
  deviceTitle: string;
  ip: string;
}
