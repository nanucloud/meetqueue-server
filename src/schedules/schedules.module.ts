import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from './domain/schedule.entity';
import { ScheduleRepository } from './infrastructure/schedule.repository';
import { ScheduleService } from './application/schedule.service';
import { ScheduleController } from './interface/schedule.controller';
import { GroupsModule } from '../groups/groups.module';
import { AttendancesModule } from '../attendances/attendances.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Schedule]),
    GroupsModule,
    AttendancesModule
  ],
  controllers: [ScheduleController],
  providers: [
    ScheduleService,
    {
      provide: 'IScheduleRepository',
      useClass: ScheduleRepository,
    },
  ],
  exports: [ScheduleService],
})
export class SchedulesModule {}