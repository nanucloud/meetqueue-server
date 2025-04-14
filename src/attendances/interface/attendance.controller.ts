import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, Req, HttpStatus } from '@nestjs/common';
import { AttendanceService } from '../application/attendance.service';
import { CreateAttendanceDto } from '../application/dto/create-attendance.dto';
import { UpdateAttendanceDto } from '../application/dto/update-attendance.dto';
import { AttendanceResponseDto } from '../application/dto/attendance-response.dto';
import { AccessTokenGuard } from '../../auth/infrastructure/access-token.guard';
import { Request } from 'express';

interface CustomRequest extends Request {
  user?: { userId: string };
}

@Controller('attendances')
@UseGuards(AccessTokenGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  async findAll(): Promise<AttendanceResponseDto[]> {
    const attendances = await this.attendanceService.findAll();
    return AttendanceResponseDto.mapList(attendances);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<AttendanceResponseDto> {
    const attendance = await this.attendanceService.findById(id);
    return new AttendanceResponseDto(attendance);
  }

  @Get('schedule/:scheduleId')
  async findByScheduleId(@Param('scheduleId') scheduleId: string): Promise<AttendanceResponseDto[]> {
    const attendances = await this.attendanceService.findByScheduleId(scheduleId);
    return AttendanceResponseDto.mapList(attendances);
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string): Promise<AttendanceResponseDto[]> {
    const attendances = await this.attendanceService.findByUserId(userId);
    return AttendanceResponseDto.mapList(attendances);
  }

  @Post()
  async create(@Body() createAttendanceDto: CreateAttendanceDto): Promise<AttendanceResponseDto> {
    const attendance = await this.attendanceService.create(createAttendanceDto);
    return new AttendanceResponseDto(attendance);
  }

  @UseGuards(AccessTokenGuard)
  @Post('check')
  async checkAttendance(
    @Body() checkAttendanceDto: { scheduleId: string; distance: number },
    @Req() req: CustomRequest
  ): Promise<HttpStatus> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('사용자 인증 정보가 없습니다.');
    }
    
    const attendance = await this.attendanceService.checkAttendance(
      checkAttendanceDto.scheduleId,
      userId,
      checkAttendanceDto.distance,
    );
    return HttpStatus.OK
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ): Promise<AttendanceResponseDto> {
    const attendance = await this.attendanceService.update(id, updateAttendanceDto);
    return new AttendanceResponseDto(attendance);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.attendanceService.remove(id);
  }
}