import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IBusTemplateRepository } from '../domain/bus-template.repository.interface';
import { BusTemplate } from '../domain/bus-template.entity';
import { CreateBusTemplateDto } from './dto/create-bus-template.dto';
import { UpdateBusTemplateDto } from './dto/update-bus-template.dto';

@Injectable()
export class BusTemplateService {
  constructor(
    @Inject('IBusTemplateRepository')
    private readonly busTemplateRepository: IBusTemplateRepository,
  ) {}

  async findAll(): Promise<BusTemplate[]> {
    return this.busTemplateRepository.findAll();
  }

  async findById(id: string): Promise<BusTemplate> {
    const busTemplate = await this.busTemplateRepository.findById(id);
    if (!busTemplate) {
      throw new NotFoundException(`버스 템플릿 ID ${id}를 찾을 수 없습니다.`);
    }
    return busTemplate;
  }

  async create(createBusTemplateDto: CreateBusTemplateDto): Promise<BusTemplate> {
    const busTemplate = new BusTemplate();
    busTemplate.name = createBusTemplateDto.name;
    busTemplate.rows = createBusTemplateDto.rows;
    busTemplate.seatsPerRow = createBusTemplateDto.seatsPerRow;
    busTemplate.totalSeats = createBusTemplateDto.totalSeats;
    busTemplate.hasAisle = createBusTemplateDto.hasAisle;
    busTemplate.description = createBusTemplateDto.description || null;
    
    return this.busTemplateRepository.create(busTemplate);
  }

  async update(id: string, updateBusTemplateDto: UpdateBusTemplateDto): Promise<BusTemplate> {
    const busTemplate = await this.findById(id);
    
    if (updateBusTemplateDto.name) busTemplate.name = updateBusTemplateDto.name;
    if (updateBusTemplateDto.rows) busTemplate.rows = updateBusTemplateDto.rows;
    if (updateBusTemplateDto.seatsPerRow) busTemplate.seatsPerRow = updateBusTemplateDto.seatsPerRow;
    if (updateBusTemplateDto.totalSeats) busTemplate.totalSeats = updateBusTemplateDto.totalSeats;
    if (updateBusTemplateDto.hasAisle !== undefined) busTemplate.hasAisle = updateBusTemplateDto.hasAisle;
    if (updateBusTemplateDto.description !== undefined) busTemplate.description = updateBusTemplateDto.description;
    
    const updatedBusTemplate = await this.busTemplateRepository.update(id, busTemplate);
    if (!updatedBusTemplate) {
      throw new NotFoundException(`버스 템플릿 ID ${id} 업데이트에 실패했습니다.`);
    }
    
    return updatedBusTemplate;
  }

  async remove(id: string): Promise<void> {
    await this.findById(id); // 존재 확인
    await this.busTemplateRepository.delete(id);
  }
}
