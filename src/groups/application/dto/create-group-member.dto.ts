import { IsBoolean, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateGroupMemberDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;
}
