import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Schedule } from '../../schedules/domain/schedule.entity';
import { User } from '../../users/domain/user.entity';
import { AttendanceStatus } from './AttendanceStatus';

@Entity('tbl_attendance')
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  attendanceId: string;

  @Column()
  scheduleId: string;

  @Column()
  userId: string;

  @Column({ type: 'float', nullable: true })
  distanceFromLocation: number;

  @Column({ type: 'datetime', nullable: true })
  attendanceTime: Date;

  @Column()
  status: AttendanceStatus;

  @ManyToOne(() => Schedule, (schedule) => schedule.attendances, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'scheduleId' })
  schedule: Schedule;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
