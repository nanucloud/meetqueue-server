import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateAttendanceDto {
  @IsNumber()
  @IsOptional()
  distanceFromLocation?: number;

  @IsDateString()
  @IsOptional()
  attendanceTime?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
