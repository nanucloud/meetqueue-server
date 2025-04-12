import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateScheduleDto {
  @IsString()
  @IsOptional()
  scheduleName?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsDateString()
  @IsOptional()
  scheduleTime?: string;

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
