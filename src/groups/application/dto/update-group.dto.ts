import { IsOptional, IsString } from 'class-validator';

export class UpdateGroupDto {
  @IsString()
  @IsOptional()
  groupName?: string;
}
