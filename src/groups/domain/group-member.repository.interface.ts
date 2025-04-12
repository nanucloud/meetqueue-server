import { GroupMember } from './group-member.entity';

export interface IGroupMemberRepository {
  findAll(): Promise<GroupMember[]>;
  findByGroupId(groupId: string): Promise<GroupMember[]>;
  findByUserId(userId: string): Promise<GroupMember[]>;
  findByUserAndGroupId(userId: string, groupId: string): Promise<GroupMember | null>;
  create(groupMember: GroupMember): Promise<GroupMember>;
  update(userId: string, groupId: string, groupMember: Partial<GroupMember>): Promise<GroupMember | null>;
  delete(userId: string, groupId: string): Promise<void>;
}
