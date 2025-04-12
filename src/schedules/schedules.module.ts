import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from './domain/schedule.entity';
import { ScheduleRepository } from './infrastructure/schedule.repository';
import { ScheduleService } from './application/schedule.service';
import { ScheduleController } from './interface/schedule.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Schedule])],
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
