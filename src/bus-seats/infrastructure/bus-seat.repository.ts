import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusSeat } from '../domain/bus-seat.entity';
import { IBusSeatRepository } from '../domain/bus-seat.repository.interface';

@Injectable()
export class BusSeatRepository implements IBusSeatRepository {
  constructor(
    @InjectRepository(BusSeat)
    private readonly busSeatRepository: Repository<BusSeat>,
  ) {}

  async findAll(): Promise<BusSeat[]> {
    return this.busSeatRepository.find({
      relations: ['busTemplate', 'user', 'schedule'],
    });
  }

  async findById(id: string): Promise<BusSeat | null> {
    return this.busSeatRepository.findOne({
      where: { id },
      relations: ['busTemplate', 'user', 'schedule'],
    });
  }

  async findBySchedule(scheduleId: string): Promise<BusSeat[]> {
    return this.busSeatRepository.find({
      where: { scheduleId },
      relations: ['busTemplate', 'user', 'schedule'],
    });
  }

  async findByBusTemplate(busTemplateId: string): Promise<BusSeat[]> {
    return this.busSeatRepository.find({
      where: { busTemplateId },
      relations: ['busTemplate', 'user', 'schedule'],
    });
  }

  async findByScheduleAndBusTemplate(scheduleId: string, busTemplateId: string): Promise<BusSeat[]> {
    return this.busSeatRepository.find({
      where: { scheduleId, busTemplateId },
      relations: ['busTemplate', 'user', 'schedule'],
    });
  }

  async findByUser(userId: string): Promise<BusSeat[]> {
    return this.busSeatRepository.find({
      where: { userId },
      relations: ['busTemplate', 'user', 'schedule'],
    });
  }

  async findByUserAndSchedule(userId: string, scheduleId: string): Promise<BusSeat | null> {
    return this.busSeatRepository.findOne({
      where: { userId, scheduleId },
      relations: ['busTemplate', 'user', 'schedule'],
    });
  }

  async create(busSeat: BusSeat): Promise<BusSeat> {
    return this.busSeatRepository.save(busSeat);
  }

  async update(id: string, busSeat: BusSeat): Promise<BusSeat | null> {
    await this.busSeatRepository.update(id, busSeat);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.busSeatRepository.delete(id);
  }

  async bulkCreate(busSeats: BusSeat[]): Promise<BusSeat[]> {
    return this.busSeatRepository.save(busSeats);
  }

  async deleteByBusTemplate(busTemplateId: string): Promise<void> {
    await this.busSeatRepository.delete({ busTemplateId });
  }

  async deleteBySchedule(scheduleId: string): Promise<void> {
    await this.busSeatRepository.delete({ scheduleId });
  }
}
