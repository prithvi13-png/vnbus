export class AuthTokenEntity {
  constructor(
    readonly accessToken: string,
    readonly refreshToken: string,
    readonly expiresInSeconds: number,
  ) {}
}
