import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { GroupMember } from '../../groups/domain/group-member.entity';

@Entity('tbl_user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  UUID: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'VARCHAR(50)' })
  username: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'VARCHAR(100)', unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'VARCHAR' })
  password: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  refreshToken: string | null;

  @OneToMany(() => GroupMember, groupMember => groupMember.user)
  groupMembers: GroupMember[];
}
