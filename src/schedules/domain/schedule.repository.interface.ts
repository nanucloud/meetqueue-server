import { Schedule } from './schedule.entity';

export interface IScheduleRepository {
  findAll(): Promise<Schedule[]>;
  findById(id: string): Promise<Schedule | null>;
  findByGroupId(groupId: string): Promise<Schedule[]>;
  create(schedule: Schedule): Promise<Schedule>;
  update(id: string, schedule: Partial<Schedule>): Promise<Schedule | null>;
  delete(id: string): Promise<void>;
}
