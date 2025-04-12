import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusSeat } from './domain/bus-seat.entity';
import { BusSeatService } from './application/bus-seat.service';
import { BusSeatController } from './interface/bus-seat.controller';
import { BusSeatRepository } from './infrastructure/bus-seat.repository';
import { BusTemplatesModule } from '../bus-templates/bus-templates.module';
import { UsersModule } from '../users/users.module';
import { SchedulesModule } from '../schedules/schedules.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BusSeat]),
    BusTemplatesModule,
    UsersModule,
    SchedulesModule
  ],
  controllers: [BusSeatController],
  providers: [
    BusSeatService,
    {
      provide: 'IBusSeatRepository',
      useClass: BusSeatRepository,
    },
  ],
  exports: [BusSeatService],
})
export class BusSeatsModule {}
