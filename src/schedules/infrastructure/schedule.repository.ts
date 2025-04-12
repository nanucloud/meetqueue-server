import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from '../domain/schedule.entity';
import { IScheduleRepository } from '../domain/schedule.repository.interface';

@Injectable()
export class ScheduleRepository implements IScheduleRepository {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
  ) {}

  async findAll(): Promise<Schedule[]> {
    return this.scheduleRepository.find();
  }

  async findById(id: string): Promise<Schedule | null> {
    return this.scheduleRepository.findOne({
      where: { scheduleId: id },
      relations: ['group'],
    });
  }

  async findByGroupId(groupId: string): Promise<Schedule[]> {
    return this.scheduleRepository.find({
      where: { groupId },
      relations: ['group'],
    });
  }

  async create(schedule: Schedule): Promise<Schedule> {
    return this.scheduleRepository.save(schedule);
  }

  async update(id: string, scheduleData: Partial<Schedule>): Promise<Schedule | null> {
    await this.scheduleRepository.update({ scheduleId: id }, scheduleData);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.scheduleRepository.delete({ scheduleId: id });
  }
}
