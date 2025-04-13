import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateGroupDto {
  @IsString()
  @IsOptional()
  groupName?: string;
  
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
  
  @IsString()
  @IsOptional()
  description?: string;
  
  @IsBoolean()
  @IsOptional()
  regenerateInviteCode?: boolean;
}
