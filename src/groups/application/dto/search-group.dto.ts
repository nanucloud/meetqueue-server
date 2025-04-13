import { IsOptional, IsString } from 'class-validator';

export class SearchGroupDto {
  @IsString()
  @IsOptional()
  keyword?: string;
  
  @IsString()
  @IsOptional()
  sortBy?: 'name' | 'members' | 'created';
  
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}
