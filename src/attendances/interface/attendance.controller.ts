import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { AttendanceService } from '../application/attendance.service';
import { CreateAttendanceDto } from '../application/dto/create-attendance.dto';
import { UpdateAttendanceDto } from '../application/dto/update-attendance.dto';
import { Attendance } from '../domain/attendance.entity';

@Controller('attendances')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  async findAll(): Promise<Attendance[]> {
    return this.attendanceService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Attendance> {
    return this.attendanceService.findById(id);
  }

  @Get('schedule/:scheduleId')
  async findByScheduleId(@Param('scheduleId') scheduleId: string): Promise<Attendance[]> {
    return this.attendanceService.findByScheduleId(scheduleId);
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string): Promise<Attendance[]> {
    return this.attendanceService.findByUserId(userId);
  }

  @Post()
  async create(@Body() createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Post('check')
  async checkAttendance(
    @Body() checkAttendanceDto: { scheduleId: string; userId: string; distance: number },
  ): Promise<Attendance> {
    return this.attendanceService.checkAttendance(
      checkAttendanceDto.scheduleId,
      checkAttendanceDto.userId,
      checkAttendanceDto.distance,
    );
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ): Promise<Attendance> {
    return this.attendanceService.update(id, updateAttendanceDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.attendanceService.remove(id);
  }
}
