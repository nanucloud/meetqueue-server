import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { BusTemplateService } from '../application/bus-template.service';
import { CreateBusTemplateDto } from '../application/dto/create-bus-template.dto';
import { UpdateBusTemplateDto } from '../application/dto/update-bus-template.dto';
import { BusTemplate } from '../domain/bus-template.entity';
import { AccessTokenGuard } from '../../auth/infrastructure/access-token.guard';
import { Role } from '../../auth/infrastructure/roles';

@Controller('bus-templates')
@UseGuards(AccessTokenGuard)
export class BusTemplateController {
  constructor(private readonly busTemplateService: BusTemplateService) {}

  @Get()
  async findAll(): Promise<BusTemplate[]> {
    return this.busTemplateService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<BusTemplate> {
    return this.busTemplateService.findById(id);
  }

  @Post()
  async create(@Body() createBusTemplateDto: CreateBusTemplateDto): Promise<BusTemplate> {
    return this.busTemplateService.create(createBusTemplateDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBusTemplateDto: UpdateBusTemplateDto,
  ): Promise<BusTemplate> {
    return this.busTemplateService.update(id, updateBusTemplateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.busTemplateService.remove(id);
  }
}
