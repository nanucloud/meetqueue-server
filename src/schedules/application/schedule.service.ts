import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IScheduleRepository } from '../domain/schedule.repository.interface';
import { Schedule } from '../domain/schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(
    @Inject('IScheduleRepository')
    private readonly scheduleRepository: IScheduleRepository,
  ) {}

  async findAll(): Promise<Schedule[]> {
    return this.scheduleRepository.findAll();
  }

  async findById(id: string): Promise<Schedule> {
    const schedule = await this.scheduleRepository.findById(id);
    if (!schedule) {
      throw new NotFoundException(`스케줄 ID ${id}를 찾을 수 없습니다.`);
    }
    return schedule;
  }

  async findByGroupId(groupId: string): Promise<Schedule[]> {
    return this.scheduleRepository.findByGroupId(groupId);
  }

  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    const schedule = new Schedule();
    schedule.groupId = createScheduleDto.groupId;
    schedule.scheduleName = createScheduleDto.scheduleName;
    schedule.location = createScheduleDto.location || '';
    schedule.scheduleTime = new Date(createScheduleDto.scheduleTime);
    schedule.detailLocation = createScheduleDto.detailLocation || '';
    schedule.detailLocation2 = createScheduleDto.detailLocation2 || '';
    schedule.locationRange = createScheduleDto.locationRange || '';
    
    return this.scheduleRepository.create(schedule);
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto): Promise<Schedule> {
    const schedule = await this.findById(id);
    
    if (updateScheduleDto.scheduleName) {
      schedule.scheduleName = updateScheduleDto.scheduleName;
    }
    if (updateScheduleDto.location !== undefined) {
      schedule.location = updateScheduleDto.location;
    }
    if (updateScheduleDto.scheduleTime) {
      schedule.scheduleTime = new Date(updateScheduleDto.scheduleTime);
    }
    if (updateScheduleDto.detailLocation !== undefined) {
      schedule.detailLocation = updateScheduleDto.detailLocation;
    }
    if (updateScheduleDto.detailLocation2 !== undefined) {
      schedule.detailLocation2 = updateScheduleDto.detailLocation2;
    }
    if (updateScheduleDto.locationRange !== undefined) {
      schedule.locationRange = updateScheduleDto.locationRange;
    }
    
    const updatedSchedule = await this.scheduleRepository.update(id, schedule);
    if (!updatedSchedule) {
      throw new NotFoundException(`스케줄 ID ${id} 업데이트에 실패했습니다.`);
    }
    
    return updatedSchedule;
  }

  async remove(id: string): Promise<void> {
    await this.findById(id); // 존재 확인
    await this.scheduleRepository.delete(id);
  }
}
