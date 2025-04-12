import { IsString, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateBusSeatDto {
  @IsInt()
  @Min(1)
  seatNumber: number;

  @IsString()
  @IsOptional()
  seatLabel?: string;

  @IsInt()
  @Min(0)
  rowPosition: number;

  @IsInt()
  @Min(0)
  columnPosition: number;

  @IsUUID()
  busTemplateId: string;

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
