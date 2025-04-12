import { IsString, IsInt, IsBoolean, IsOptional, Min, Max } from 'class-validator';

export class CreateBusTemplateDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  @Max(50)
  rows: number;

  @IsInt()
  @Min(1)
  @Max(10)
  seatsPerRow: number;

  @IsInt()
  @Min(1)
  totalSeats: number;

  @IsBoolean()
  hasAisle: boolean;

  @IsString()
  @IsOptional()
  description?: string;
}
