import { IsString } from 'class-validator';

export class OAuthVerifyDto {
  @IsString()
  authCode: string;

  @IsString()
  applicationSecret: string;
}
