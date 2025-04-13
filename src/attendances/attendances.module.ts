import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './domain/attendance.entity';
import { AttendanceRepository } from './infrastructure/attendance.repository';
import { AttendanceService } from './application/attendance.service';
import { AttendanceController } from './interface/attendance.controller';
import { Schedule } from 'src/schedules/domain/schedule.entity';
import { ScheduleRepository } from 'src/schedules/infrastructure/schedule.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance, Schedule])],
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    AttendanceRepository,
    ScheduleRepository,
    {
      provide: 'IAttendanceRepository',
      useClass: AttendanceRepository,
    },
    {
      provide: 'IScheduleRepository',
      useClass: ScheduleRepository,
    },
  ],
  exports: [AttendanceService, 'IAttendanceRepository'],
})
export class AttendancesModule {}
