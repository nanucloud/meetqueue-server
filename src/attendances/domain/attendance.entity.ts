import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Schedule } from '../../schedules/domain/schedule.entity';
import { User } from '../../users/domain/user.entity';

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

  @Column({ type: 'varchar', length: 20, default: '미출석' })
  status: string; // '출석', '지각', '결석', '미출석'

  @ManyToOne(() => Schedule, schedule => schedule.attendances)
  @JoinColumn({ name: 'scheduleId' })
  schedule: Schedule;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
