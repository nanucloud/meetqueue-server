import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ScheduleService } from '../application/schedule.service';
import { CreateScheduleDto } from '../application/dto/create-schedule.dto';
import { UpdateScheduleDto } from '../application/dto/update-schedule.dto';
import { Schedule } from '../domain/schedule.entity';

@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  async findAll(): Promise<Schedule[]> {
    return this.scheduleService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Schedule> {
    return this.scheduleService.findById(id);
  }

  @Get('group/:groupId')
  async findByGroupId(@Param('groupId') groupId: string): Promise<Schedule[]> {
    return this.scheduleService.findByGroupId(groupId);
  }

  @Post()
  async create(@Body() createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    return this.scheduleService.create(createScheduleDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ): Promise<Schedule> {
    return this.scheduleService.update(id, updateScheduleDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.scheduleService.remove(id);
  }
}
