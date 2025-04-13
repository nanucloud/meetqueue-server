import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from '../../groups/domain/group.entity';
import { Attendance } from '../../attendances/domain/attendance.entity';

@Entity('tbl_schedule')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  scheduleId: string;

  @Column()
  groupId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  scheduleName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'datetime', nullable: true })
  scheduleTime: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  detailLocation: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  detailLocation2: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  locationRange: string;

  @ManyToOne(() => Group, group => group.schedules)
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @OneToMany(() => Attendance, attendance => attendance.schedule, { 
    cascade: ['remove'], 
    onDelete: 'CASCADE' 
  })
  attendances: Attendance[];
}
