import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

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
  status?: string;
}
