import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ScheduleService } from '../application/schedule.service';
import { CreateScheduleDto } from '../application/dto/create-schedule.dto';
import { UpdateScheduleDto } from '../application/dto/update-schedule.dto';
import { Schedule } from '../domain/schedule.entity';
import { AccessTokenGuard } from '../../auth/infrastructure/access-token.guard';
import { RolesGuard } from '../../auth/infrastructure/roles.guard';
import { Roles, Role } from '../../auth/infrastructure/roles.decorator';
import { Request } from 'express';

interface CustomRequest extends Request {
  user?: { userId: string };
}

@Controller('schedules')
@UseGuards(AccessTokenGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  async findAll(@Req() req: CustomRequest): Promise<any[]> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('사용자 인증 정보가 없습니다.');
    }
    // 사용자가 속한 그룹의 일정만 가져오기
    const schedules = await this.scheduleService.findAllUserSchedules(userId);

    // 각 일정에 관리자가 아닌 출석자 수와 사용자의 관리자/출석 여부 추가
    const schedulesWithExtra = await Promise.all(
      schedules.map(async (schedule) => {
        const isAdmin = await this.scheduleService.isUserGroupAdmin(
          userId,
          schedule.groupId,
        );
        const isAttended = await this.scheduleService.isUserAttended(
          userId,
          schedule.scheduleId,
        );
        const nonAdminAttendanceCount =
          await this.scheduleService.getNonAdminAttendanceCount(
            schedule.scheduleId,
          );

        return {
          ...schedule,
          is_admin: isAdmin,
          is_attended: isAttended,
          non_admin_attendance_count: nonAdminAttendanceCount,
        };
      }),
    );

    return schedulesWithExtra;
  }

  @Get('group/:groupId')
  async findByGroupId(@Param('groupId') groupId: string): Promise<any[]> {
    const schedules = await this.scheduleService.findByGroupId(groupId);

    // 각 일정에 관리자가 아닌 출석자 수 추가
    const schedulesWithAttendances = await Promise.all(
      schedules.map(async (schedule) => {
        const nonAdminAttendanceCount =
          await this.scheduleService.getNonAdminAttendanceCount(
            schedule.scheduleId,
          );
        return {
          ...schedule,
          non_admin_attendance_count: nonAdminAttendanceCount,
        };
      }),
    );

    return schedulesWithAttendances;
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard)
  async findOne(
    @Param('id') id: string,
    @Req() req: CustomRequest,
  ): Promise<any> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('사용자 인증 정보가 없습니다.');
    }

    // 일정 정보 가져오기
    const schedule = await this.scheduleService.findById(id);

    // 1. 그룹의 관리자인지 확인
    const isAdmin = await this.scheduleService.isUserGroupAdmin(
      userId,
      schedule.groupId,
    );

    // 2. 이미 출석했는지 확인
    const isAttended = await this.scheduleService.isUserAttended(userId, id);

    // 3. 관리자를 제외한 출석자 수 가져오기
    const nonAdminAttendanceCount =
      await this.scheduleService.getNonAdminAttendanceCount(id);

    // 추가 정보와 함께 반환
    return {
      ...schedule,
      is_admin: isAdmin,
      is_attended: isAttended,
      non_admin_attendance_count: nonAdminAttendanceCount,
    };
  }

  @Post()
  async create(
    @Body() createScheduleDto: CreateScheduleDto,
    @Req() req: CustomRequest,
  ): Promise<Schedule> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('사용자 인증 정보가 없습니다.');
    }
    return this.scheduleService.create(createScheduleDto, userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
    @Req() req: CustomRequest,
  ): Promise<Schedule> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('사용자 인증 정보가 없습니다.');
    }

    const schedule = await this.scheduleService.findById(id);

    // 그룹 관리자인지 확인
    const isAdmin = await this.scheduleService.isUserGroupAdmin(
      userId,
      schedule.groupId,
    );
    if (!isAdmin) {
      throw new ForbiddenException('일정을 수정할 권한이 없습니다.');
    }

    return this.scheduleService.update(id, updateScheduleDto, userId);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: CustomRequest,
  ): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('사용자 인증 정보가 없습니다.');
    }

    // 일정 정보 조회
    const schedule = await this.scheduleService.findById(id);

    // 그룹 관리자인지 확인
    const isAdmin = await this.scheduleService.isUserGroupAdmin(
      userId,
      schedule.groupId,
    );
    if (!isAdmin) {
      throw new ForbiddenException('일정을 삭제할 권한이 없습니다.');
    }

    return this.scheduleService.remove(id, userId);
  }
}
