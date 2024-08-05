export type twoTokenType = {
  access: string;
  refresh: string;
};
export type RefreshTokenPayloadType = {
  userId: string;
  deviceId: string;
  iat: string;
  exp: string;
};
