import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusTemplate } from '../domain/bus-template.entity';
import { IBusTemplateRepository } from '../domain/bus-template.repository.interface';

@Injectable()
export class BusTemplateRepository implements IBusTemplateRepository {
  constructor(
    @InjectRepository(BusTemplate)
    private readonly busTemplateRepository: Repository<BusTemplate>,
  ) {}

  async findAll(): Promise<BusTemplate[]> {
    return this.busTemplateRepository.find();
  }

  async findById(id: string): Promise<BusTemplate | null> {
    return this.busTemplateRepository.findOne({ where: { id } });
  }

  async create(busTemplate: BusTemplate): Promise<BusTemplate> {
    return this.busTemplateRepository.save(busTemplate);
  }

  async update(id: string, busTemplate: BusTemplate): Promise<BusTemplate | null> {
    await this.busTemplateRepository.update(id, busTemplate);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.busTemplateRepository.delete(id);
  }
}
