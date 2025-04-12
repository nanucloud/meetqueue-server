import { IsString, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class UpdateBusSeatDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  seatNumber?: number;

  @IsString()
  @IsOptional()
  seatLabel?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  rowPosition?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  columnPosition?: number;

  @IsUUID()
  @IsOptional()
  busTemplateId?: string;

  @IsUUID()
  @IsOptional()
  scheduleId?: string;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
