import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IAttendanceRepository } from '../domain/attendance.repository.interface';
import { Attendance } from '../domain/attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @Inject('IAttendanceRepository')
    private readonly attendanceRepository: IAttendanceRepository,
  ) {}

  async findAll(): Promise<Attendance[]> {
    return this.attendanceRepository.findAll();
  }

  async findById(id: string): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findById(id);
    if (!attendance) {
      throw new NotFoundException(`출석 ID ${id}를 찾을 수 없습니다.`);
    }
    return attendance;
  }

  async findByScheduleId(scheduleId: string): Promise<Attendance[]> {
    return this.attendanceRepository.findByScheduleId(scheduleId);
  }

  async findByUserId(userId: string): Promise<Attendance[]> {
    return this.attendanceRepository.findByUserId(userId);
  }

  async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    const attendance = new Attendance();
    attendance.scheduleId = createAttendanceDto.scheduleId;
    attendance.userId = createAttendanceDto.userId;
    
    if (createAttendanceDto.distanceFromLocation !== undefined) {
      attendance.distanceFromLocation = createAttendanceDto.distanceFromLocation;
    }
    
    if (createAttendanceDto.attendanceTime) {
      attendance.attendanceTime = new Date(createAttendanceDto.attendanceTime);
    } else {
      attendance.attendanceTime = new Date();
    }
    
    if (createAttendanceDto.status) {
      attendance.status = createAttendanceDto.status;
    }
    
    return this.attendanceRepository.create(attendance);
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto): Promise<Attendance> {
    const attendance = await this.findById(id);
    
    if (updateAttendanceDto.distanceFromLocation !== undefined) {
      attendance.distanceFromLocation = updateAttendanceDto.distanceFromLocation;
    }
    
    if (updateAttendanceDto.attendanceTime) {
      attendance.attendanceTime = new Date(updateAttendanceDto.attendanceTime);
    }
    
    if (updateAttendanceDto.status) {
      attendance.status = updateAttendanceDto.status;
    }
    
    const updatedAttendance = await this.attendanceRepository.update(id, attendance);
    if (!updatedAttendance) {
      throw new NotFoundException(`출석 ID ${id} 업데이트에 실패했습니다.`);
    }
    
    return updatedAttendance;
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.attendanceRepository.delete(id);
  }

  // 출석 체크 메서드
  async checkAttendance(scheduleId: string, userId: string, distance: number): Promise<Attendance> {
    // 기존 출석 기록이 있는지 확인
    let attendance = await this.attendanceRepository.findByScheduleAndUserId(scheduleId, userId);
    
    // 출석 상태 결정 (거리에 따라)
    let status = '출석';
    if (distance > 100) { // 100m 이상 떨어져 있으면 지각으로 처리
      status = '지각';
    }
    
    if (attendance) {
      // 기존 출석 기록이 있으면 업데이트
      const updateDto: UpdateAttendanceDto = {
        distanceFromLocation: distance,
        attendanceTime: new Date().toISOString(),
        status: status
      };
      return this.update(attendance.attendanceId, updateDto);
    } else {
      // 신규 출석 기록 생성
      const createDto: CreateAttendanceDto = {
        scheduleId,
        userId,
        distanceFromLocation: distance,
        attendanceTime: new Date().toISOString(),
        status: status
      };
      return this.create(createDto);
    }
  }
}
