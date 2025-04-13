import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateMemberRoleDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
  
  @IsBoolean()
  @IsNotEmpty()
  isAdmin: boolean;
}
