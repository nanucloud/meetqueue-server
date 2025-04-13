import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class JoinGroupDto {
  @IsString()
  @IsNotEmpty()
  inviteCode: string;
}
