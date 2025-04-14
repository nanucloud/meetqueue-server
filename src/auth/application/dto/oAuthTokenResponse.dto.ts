import { IsString } from 'class-validator';

export class OAuthTokenResponseDto {
  @IsString()
  access_token: string;

  @IsString()
  refresh_token: string;
}