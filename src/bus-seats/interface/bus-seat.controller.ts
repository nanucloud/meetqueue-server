import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { BusSeatService } from '../application/bus-seat.service';
import { CreateBusSeatDto } from '../application/dto/create-bus-seat.dto';
import { UpdateBusSeatDto } from '../application/dto/update-bus-seat.dto';
import { AssignSeatDto } from '../application/dto/assign-seat.dto';
import { BatchCreateSeatsDto } from '../application/dto/batch-create-seats.dto';
import { BusSeat } from '../domain/bus-seat.entity';
import { AccessTokenGuard } from '../../auth/infrastructure/access-token.guard';
import { Role } from '../../auth/infrastructure/roles';

@Controller('bus-seats')
@UseGuards(AccessTokenGuard)
export class BusSeatController {
  constructor(private readonly busSeatService: BusSeatService) {}

  @Get()
  async findAll(
    @Query('scheduleId') scheduleId?: string,
    @Query('busTemplateId') busTemplateId?: string,
    @Query('userId') userId?: string,
  ): Promise<BusSeat[]> {
    if (scheduleId && busTemplateId) {
      return this.busSeatService.findByScheduleAndBusTemplate(scheduleId, busTemplateId);
    } else if (scheduleId) {
      return this.busSeatService.findBySchedule(scheduleId);
    } else if (busTemplateId) {
      return this.busSeatService.findByBusTemplate(busTemplateId);
    } else if (userId) {
      return this.busSeatService.findByUser(userId);
    } else {
      return this.busSeatService.findAll();
    }
  }

  @Get('user-schedule')
  async findByUserAndSchedule(
    @Query('userId') userId: string,
    @Query('scheduleId') scheduleId: string,
  ): Promise<BusSeat | null> {
    return this.busSeatService.findByUserAndSchedule(userId, scheduleId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<BusSeat> {
    return this.busSeatService.findById(id);
  }

  @Post()
  async create(@Body() createBusSeatDto: CreateBusSeatDto): Promise<BusSeat> {
    return this.busSeatService.create(createBusSeatDto);
  }

  @Post('batch')
  async batchCreateSeats(@Body() batchCreateSeatsDto: BatchCreateSeatsDto): Promise<BusSeat[]> {
    return this.busSeatService.batchCreateSeats(batchCreateSeatsDto);
  }

  @Post('assign')
  async assignSeat(@Body() assignSeatDto: AssignSeatDto): Promise<BusSeat> {
    return this.busSeatService.assignSeat(assignSeatDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBusSeatDto: UpdateBusSeatDto,
  ): Promise<BusSeat> {
    return this.busSeatService.update(id, updateBusSeatDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.busSeatService.remove(id);
  }

  @Delete('schedule/:scheduleId')
  async removeBySchedule(@Param('scheduleId') scheduleId: string): Promise<void> {
    return this.busSeatService.deleteBySchedule(scheduleId);
  }

  @Delete('bus-template/:busTemplateId')
  async removeByBusTemplate(@Param('busTemplateId') busTemplateId: string): Promise<void> {
    return this.busSeatService.deleteByBusTemplate(busTemplateId);
  }
}
