import { IsString, IsUUID } from 'class-validator';

export class AssignSeatDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  seatId: string;

  @IsString()
  busTemplateId: string;
}
