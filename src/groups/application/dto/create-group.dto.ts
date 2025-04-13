import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  groupName: string;
  
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean = false;
  
  @IsString()
  @IsOptional()
  description?: string;
}
