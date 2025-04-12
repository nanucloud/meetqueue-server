import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BusTemplate } from '../../bus-templates/domain/bus-template.entity';
import { User } from '../../users/domain/user.entity';
import { Schedule } from '../../schedules/domain/schedule.entity';

@Entity('tbl_bus_seat')
export class BusSeat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  seatNumber: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  seatLabel: string;

  @Column({ type: 'int' })
  rowPosition: number;

  @Column({ type: 'int' })
  columnPosition: number;

  @ManyToOne(() => BusTemplate, busTemplate => busTemplate.seats)
  @JoinColumn({ name: 'busTemplateId' })
  busTemplate: BusTemplate;

  @Column({ type: 'uuid' })
  busTemplateId: string;

  @ManyToOne(() => Schedule, { nullable: true })
  @JoinColumn({ name: 'scheduleId' })
  schedule: Schedule;

  @Column({ type: 'uuid', nullable: true })
  scheduleId: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  status: string; // 'empty', 'assigned', 'occupied'
}
