import { IsUUID, IsInt, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class BatchCreateSeatsDto {
  @IsUUID()
  busTemplateId: string;

  @IsUUID()
  scheduleId: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  rows: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  seatsPerRow: number;

  @IsBoolean()
  hasAisle: boolean;
}
