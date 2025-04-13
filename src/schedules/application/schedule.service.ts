import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IAttendanceRepository } from 'src/attendances/domain/attendance.repository.interface';
import { GroupMemberService } from 'src/groups/application/group-member.service';
import { IScheduleRepository } from '../domain/schedule.repository.interface';
import { Schedule } from '../domain/schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { AttendanceStatus } from 'src/attendances/domain/AttendanceStatus';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly groupMemberService: GroupMemberService,
    @Inject('IAttendanceRepository')
    private readonly attendanceRepository: IAttendanceRepository,
    @Inject('IScheduleRepository')
    private readonly scheduleRepository: IScheduleRepository,
  ) {}

  async isUserGroupAdmin(userId: string, groupId: string): Promise<boolean> {
    try {
      const membership =
        await this.groupMemberService.findByUserAndGroupIdOrNull(
          userId,
          groupId,
        );
      return membership ? membership.isAdmin : false;
    } catch (error) {
      console.error('Error checking user group admin status:', error);
      return false;
    }
  }

  async isUserAttended(userId: string, scheduleId: string): Promise<boolean> {
    try {
      const attendance =
        await this.attendanceRepository.findByUserAndScheduleId(
          userId,
          scheduleId,
        );
      return !!attendance;
    } catch (error) {
      console.error('Error checking user attendance status:', error);
      return false;
    }
  }

  /**
   * 관리자를 제외한 출석자 수 조회
   *
   * @param scheduleId 일정 ID
   * @returns 일반 회원 출석자 수
   */
  async getNonAdminAttendanceCount(scheduleId: string): Promise<number> {
    // 1. 해당 일정의 출석 정보 모두 가져오기
    const attendances =
      await this.attendanceRepository.findByScheduleId(scheduleId);

    if (!attendances || attendances.length === 0) {
      return 0;
    }

    // 2. 출석한 사용자만 필터링 (출석 상태가 '출석' 또는 '지각'인 경우)
    const attendedUsers = attendances.filter(
      (attendance) =>
        attendance.status === AttendanceStatus.OK ||
        attendance.status === AttendanceStatus.LATE 
    );

    if (attendedUsers.length === 0) {
      return 0;
    }

    // 3. 일정이 속한 그룹 찾기
    const schedule = await this.findById(scheduleId);
    const groupId = schedule.groupId;

    // 4. 출석한 사용자 ID만 추출
    const attendedUserIds = attendedUsers.map(
      (attendance) => attendance.userId,
    );

    // 5. 각 사용자가 관리자인지 확인
    let nonAdminCount = 0;
    for (const userId of attendedUserIds) {
      const isAdmin = await this.isUserGroupAdmin(userId, groupId);
      if (!isAdmin) {
        nonAdminCount++;
      }
    }

    return nonAdminCount;
  }

  async findAllUserSchedules(userId: string): Promise<Schedule[]> {
    // 사용자가 속한 그룹 찾기
    const memberships = await this.groupMemberService.findMembers({ userId });
    if (!memberships || memberships.length === 0) {
      return [];
    }

    // 사용자가 속한 그룹 ID 목록 생성
    const groupIds = memberships.map((member) => member.groupId);

    // 각 그룹의 일정을 가져와서 하나의 배열로 합치기
    const schedulePromises = groupIds.map((groupId) =>
      this.scheduleRepository.findByGroupId(groupId),
    );

    const scheduleArrays = await Promise.all(schedulePromises);
    return scheduleArrays.flat();
  }

  async findByGroupId(groupId: string): Promise<Schedule[]> {
    return this.scheduleRepository.findByGroupId(groupId);
  }

  async findById(id: string): Promise<Schedule> {
    const schedule = await this.scheduleRepository.findById(id);
    if (!schedule) {
      throw new NotFoundException(`일정 ID ${id}를 찾을 수 없습니다`);
    }
    return schedule;
  }

  async create(
    createScheduleDto: CreateScheduleDto,
    userId: string,
  ): Promise<Schedule> {
    // 데이터 변환 및 저장 로직
    const schedule = new Schedule();
    schedule.scheduleName = createScheduleDto.scheduleName;
    schedule.location = createScheduleDto.location || '';
    schedule.scheduleTime = new Date(createScheduleDto.scheduleTime);
    schedule.detailLocation = createScheduleDto.detailLocation || '';
    schedule.locationRange = createScheduleDto.locationRange || '';
    schedule.groupId = createScheduleDto.groupId;

    return this.scheduleRepository.create(schedule);
  }

  async update(
    id: string,
    updateScheduleDto: UpdateScheduleDto,
    userId: string,
  ): Promise<Schedule> {
    // 일정 존재 확인
    await this.findById(id);

    // 데이터 변환
    const scheduleData: Partial<Schedule> = {};

    if (updateScheduleDto.scheduleName) {
      scheduleData.scheduleName = updateScheduleDto.scheduleName;
    }

    if (updateScheduleDto.location !== undefined) {
      scheduleData.location = updateScheduleDto.location;
    }

    if (updateScheduleDto.scheduleTime) {
      scheduleData.scheduleTime = new Date(updateScheduleDto.scheduleTime);
    }

    if (updateScheduleDto.detailLocation !== undefined) {
      scheduleData.detailLocation = updateScheduleDto.detailLocation;
    }

    if (updateScheduleDto.locationRange !== undefined) {
      scheduleData.locationRange = updateScheduleDto.locationRange;
    }

    const updated = await this.scheduleRepository.update(id, scheduleData);
    if (!updated) {
      throw new NotFoundException(
        `일정 ID ${id}를 업데이트하는데 실패했습니다`,
      );
    }

    return updated;
  }

  async remove(id: string, userId: string): Promise<void> {
    // 1. 일정 존재 확인
    const schedule = await this.findById(id);

    // 2. 그룹 관리자 확인
    const isAdmin = await this.isUserGroupAdmin(userId, schedule.groupId);
    if (!isAdmin) {
      throw new Error('삭제 권한이 없습니다.');
    }

    // 3. 해당 일정의 모든 출석 기록 삭제
    await this.attendanceRepository.deleteByScheduleId(id);

    // 4. 일정 삭제
    await this.scheduleRepository.delete(id);
  }
}
