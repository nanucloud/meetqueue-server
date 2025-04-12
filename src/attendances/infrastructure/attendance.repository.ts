import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from '../domain/attendance.entity';
import { IAttendanceRepository } from '../domain/attendance.repository.interface';

@Injectable()
export class AttendanceRepository implements IAttendanceRepository {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
  ) {}

  async findAll(): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      relations: ['schedule', 'user'],
    });
  }

  async findById(id: string): Promise<Attendance | null> {
    return this.attendanceRepository.findOne({
      where: { attendanceId: id },
      relations: ['schedule', 'user'],
    });
  }

  async findByScheduleId(scheduleId: string): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      where: { scheduleId },
      relations: ['user'],
    });
  }

  async findByUserId(userId: string): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      where: { userId },
      relations: ['schedule'],
    });
  }

  async findByScheduleAndUserId(scheduleId: string, userId: string): Promise<Attendance | null> {
    return this.attendanceRepository.findOne({
      where: { scheduleId, userId },
      relations: ['schedule', 'user'],
    });
  }

  async create(attendance: Attendance): Promise<Attendance> {
    return this.attendanceRepository.save(attendance);
  }

  async update(id: string, attendanceData: Partial<Attendance>): Promise<Attendance | null> {
    await this.attendanceRepository.update({ attendanceId: id }, attendanceData);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.attendanceRepository.delete({ attendanceId: id });
  }
}
