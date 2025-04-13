import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class JoinGroupDto {
  @IsUUID()
  @IsNotEmpty()
  groupId: string;
  
  @IsString()
  @IsNotEmpty()
  inviteCode: string;
}
