import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateGroupMemberDto {
  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;
}
