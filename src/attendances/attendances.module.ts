import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './domain/attendance.entity';
import { AttendanceRepository } from './infrastructure/attendance.repository';
import { AttendanceService } from './application/attendance.service';
import { AttendanceController } from './interface/attendance.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance])],
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    {
      provide: 'IAttendanceRepository',
      useClass: AttendanceRepository,
    },
  ],
  exports: [AttendanceService],
})
export class AttendancesModule {}
