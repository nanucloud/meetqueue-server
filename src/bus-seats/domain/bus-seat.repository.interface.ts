import { BusSeat } from './bus-seat.entity';

export interface IBusSeatRepository {
  findAll(): Promise<BusSeat[]>;
  findById(id: string): Promise<BusSeat | null>;
  findBySchedule(scheduleId: string): Promise<BusSeat[]>;
  findByBusTemplate(busTemplateId: string): Promise<BusSeat[]>;
  findByScheduleAndBusTemplate(scheduleId: string, busTemplateId: string): Promise<BusSeat[]>;
  findByUser(userId: string): Promise<BusSeat[]>;
  findByUserAndSchedule(userId: string, scheduleId: string): Promise<BusSeat | null>;
  create(busSeat: BusSeat): Promise<BusSeat>;
  update(id: string, busSeat: BusSeat): Promise<BusSeat | null>;
  delete(id: string): Promise<void>;
  bulkCreate(busSeats: BusSeat[]): Promise<BusSeat[]>;
  deleteByBusTemplate(busTemplateId: string): Promise<void>;
  deleteBySchedule(scheduleId: string): Promise<void>;
}
