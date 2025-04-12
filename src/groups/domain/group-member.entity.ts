import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Group } from './group.entity';
import { User } from '../../users/domain/user.entity';

@Entity('tbl_group_member')
export class GroupMember {
  @PrimaryColumn()
  UUID: string;

  @PrimaryColumn()
  groupId: string;

  @Column({ type: 'boolean', default: false })
  isAdmin: boolean;

  @ManyToOne(() => User, user => user.groupMembers)
  @JoinColumn({ name: 'UUID' })
  user: User;

  @ManyToOne(() => Group, group => group.members)
  @JoinColumn({ name: 'groupId' })
  group: Group;
}
