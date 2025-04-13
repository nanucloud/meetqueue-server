import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { AttendanceStatus } from 'src/attendances/domain/AttendanceStatus';

export class CreateAttendanceDto {
  @IsUUID()
  @IsNotEmpty()
  scheduleId: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;

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
