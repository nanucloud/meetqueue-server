import { Attendance } from './attendance.entity';

export interface IAttendanceRepository {
  findAll(): Promise<Attendance[]>;
  findById(id: string): Promise<Attendance | null>;
  findByScheduleId(scheduleId: string): Promise<Attendance[]>;
  findByUserId(userId: string): Promise<Attendance[]>;
  findByScheduleAndUserId(
    scheduleId: string,
    userId: string,
  ): Promise<Attendance | null>;
  findByUserAndScheduleId(
    userId: string,
    scheduleId: string,
  ): Promise<Attendance | null>;
  create(attendance: Attendance): Promise<Attendance>;
  update(
    id: string,
    attendance: Partial<Attendance>,
  ): Promise<Attendance | null>;
  delete(id: string): Promise<void>;
  deleteByScheduleId(scheduleId: string): Promise<void>;
}
