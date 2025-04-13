import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IGroupMemberRepository } from '../domain/group-member.repository.interface';
import { GroupMember } from '../domain/group-member.entity';
import { CreateGroupMemberDto } from './dto/create-group-member.dto';
import { UpdateGroupMemberDto } from './dto/update-group-member.dto';
import { GroupMemberInfoDto } from './dto/group-member-info.dto';
import { IUserRepository } from 'src/users/domain/user.repository.interface';

@Injectable()
export class GroupMemberService {
  constructor(
    @Inject('IGroupMemberRepository')
    private readonly groupMemberRepository: IGroupMemberRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async findMembers(filters: { 
    groupId?: string, 
    userId?: string 
  } = {}): Promise<GroupMemberInfoDto[]> {
    const { groupId, userId } = filters;
    
    let memberships: GroupMember[];
    
    if (groupId && userId) {
      const membership = await this.findByUserAndGroupIdOrNull(userId, groupId);
      memberships = membership ? [membership] : [];
    } else if (groupId) {
      memberships = await this.groupMemberRepository.findByGroupId(groupId);
    } else if (userId) {
      memberships = await this.groupMemberRepository.findByUserId(userId);
    } else {
      memberships = await this.groupMemberRepository.findAll();
    }

    return Promise.all(memberships.map(async (membership) => {
      const user = await this.userRepository.findById(membership.UUID);
      return new GroupMemberInfoDto(
        membership.UUID, 
        user ? user.username : '미지정',
        membership.isAdmin,
        membership.groupId
      );
    }));
  }

  async findByUserAndGroupIdOrNull(userId: string, groupId: string): Promise<GroupMember | null> {
    return this.groupMemberRepository.findByUserAndGroupId(userId, groupId);
  }

  async findByUserAndGroupId(userId: string, groupId: string): Promise<GroupMember> {
    const groupMember = await this.findByUserAndGroupIdOrNull(userId, groupId);
    if (!groupMember) {
      throw new NotFoundException(`사용자 ID ${userId}와 그룹 ID ${groupId}의 멤버십을 찾을 수 없습니다.`);
    }
    return groupMember;
  }

  async create(createGroupMemberDto: CreateGroupMemberDto): Promise<GroupMember> {
    const groupMember = new GroupMember();
    groupMember.UUID = createGroupMemberDto.userId;
    groupMember.groupId = createGroupMemberDto.groupId;
    groupMember.isAdmin = createGroupMemberDto.isAdmin ?? false;
    
    return this.groupMemberRepository.create(groupMember);
  }

  async update(userId: string, groupId: string, updateGroupMemberDto: UpdateGroupMemberDto): Promise<GroupMember> {
    const groupMember = await this.findByUserAndGroupId(userId, groupId);
    
    if (updateGroupMemberDto.isAdmin !== undefined) {
      groupMember.isAdmin = updateGroupMemberDto.isAdmin;
    }
    
    const updatedGroupMember = await this.groupMemberRepository.update(userId, groupId, groupMember);
    if (!updatedGroupMember) {
      throw new NotFoundException(`사용자 ID ${userId}와 그룹 ID ${groupId}의 멤버십 업데이트에 실패했습니다.`);
    }
    
    return updatedGroupMember;
  }

  async remove(userId: string, groupId: string): Promise<void> {
    await this.findByUserAndGroupId(userId, groupId);
    await this.groupMemberRepository.delete(userId, groupId);
  }
}