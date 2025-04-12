import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { GroupsModule } from './groups/groups.module';
import { SchedulesModule } from './schedules/schedules.module';
import { AttendancesModule } from './attendances/attendances.module';
import { AuthModule } from './auth/auth.module';
import { BusTemplatesModule } from './bus-templates/bus-templates.module';
import { BusSeatsModule } from './bus-seats/bus-seats.module';
import { HealthModule } from './health/health.module';

import { User } from './users/domain/user.entity';
import { Group } from './groups/domain/group.entity';
import { GroupMember } from './groups/domain/group-member.entity';
import { Schedule } from './schedules/domain/schedule.entity';
import { Attendance } from './attendances/domain/attendance.entity';
import { BusTemplate } from './bus-templates/domain/bus-template.entity';
import { BusSeat } from './bus-seats/domain/bus-seat.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [User, Group, GroupMember, Schedule, Attendance, BusTemplate, BusSeat],
        synchronize: configService.get('DB_SYNCHRONIZE') === 'true',
      }),
    }),
    UsersModule,
    GroupsModule,
    SchedulesModule,
    AttendancesModule,
    AuthModule,
    BusTemplatesModule,
    BusSeatsModule,
    HealthModule,
  ]
})
export class AppModule {}
