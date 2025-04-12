import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateScheduleDto {
  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @IsString()
  @IsNotEmpty()
  scheduleName: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsDateString()
  @IsNotEmpty()
  scheduleTime: string;

  @IsString()
  @IsOptional()
  detailLocation?: string;

  @IsString()
  @IsOptional()
  detailLocation2?: string;

  @IsString()
  @IsOptional()
  locationRange?: string;
}
