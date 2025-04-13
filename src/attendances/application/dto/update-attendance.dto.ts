import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';
import { AttendanceStatus } from 'src/attendances/domain/AttendanceStatus';

export class UpdateAttendanceDto {
  @IsNumber()
  @IsOptional()
  distanceFromLocation?: number;

  @IsDateString()
  @IsOptional()
  attendanceTime?: string;

  @IsString()
  @IsOptional()
  status?: AttendanceStatus;
}
