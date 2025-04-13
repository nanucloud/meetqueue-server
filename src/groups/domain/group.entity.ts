import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { GroupMember } from './group-member.entity';
import { Schedule } from '../../schedules/domain/schedule.entity';

@Entity('tbl_group')
export class Group {
  @PrimaryGeneratedColumn('uuid')
  groupId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  groupName: string;
  
  @Column({ type: 'boolean', default: false })
  isPublic: boolean;
  
  @Column({ type: 'varchar', length: 8, nullable: true })
  inviteCode: string;
  
  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => GroupMember, groupMember => groupMember.group)
  members: GroupMember[];

  @OneToMany(() => Schedule, schedule => schedule.group)
  schedules: Schedule[];
}
