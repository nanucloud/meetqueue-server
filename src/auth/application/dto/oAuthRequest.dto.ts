import { IsString } from 'class-validator';

export class OAuthVerifyCodeDto {
  @IsString()
  code: string;
}
