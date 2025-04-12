import { IsString, IsInt, IsBoolean, IsOptional, Min, Max } from 'class-validator';

export class UpdateBusTemplateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  rows?: number;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  seatsPerRow?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  totalSeats?: number;

  @IsBoolean()
  @IsOptional()
  hasAisle?: boolean;

  @IsString()
  @IsOptional()
  description?: string;
}
