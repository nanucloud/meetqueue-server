import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { GroupMember } from './group-member.entity';
import { Schedule } from '../../schedules/domain/schedule.entity';

@Entity('tbl_group')
export class Group {
  @PrimaryGeneratedColumn('uuid')
  groupId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  groupName: string;

  @OneToMany(() => GroupMember, groupMember => groupMember.group)
  members: GroupMember[];

  @OneToMany(() => Schedule, schedule => schedule.group)
  schedules: Schedule[];
}
