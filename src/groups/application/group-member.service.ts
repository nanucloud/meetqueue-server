import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IGroupMemberRepository } from '../domain/group-member.repository.interface';
import { GroupMember } from '../domain/group-member.entity';
import { CreateGroupMemberDto } from './dto/create-group-member.dto';
import { UpdateGroupMemberDto } from './dto/update-group-member.dto';

@Injectable()
export class GroupMemberService {
  constructor(
    @Inject('IGroupMemberRepository')
    private readonly groupMemberRepository: IGroupMemberRepository,
  ) {}

  async findAll(): Promise<GroupMember[]> {
    return this.groupMemberRepository.findAll();
  }

  async findByGroupId(groupId: string): Promise<GroupMember[]> {
    return this.groupMemberRepository.findByGroupId(groupId);
  }

  async findByUserId(userId: string): Promise<GroupMember[]> {
    return this.groupMemberRepository.findByUserId(userId);
  }

  async findByUserAndGroupId(userId: string, groupId: string): Promise<GroupMember> {
    const groupMember = await this.groupMemberRepository.findByUserAndGroupId(userId, groupId);
    if (!groupMember) {
      throw new NotFoundException(`사용자 ID ${userId}와 그룹 ID ${groupId}의 멤버십을 찾을 수 없습니다.`);
    }
    return groupMember;
  }

  async create(createGroupMemberDto: CreateGroupMemberDto): Promise<GroupMember> {
    const groupMember = new GroupMember();
    groupMember.UUID = createGroupMemberDto.userId;
    groupMember.groupId = createGroupMemberDto.groupId;
    groupMember.isAdmin = createGroupMemberDto.isAdmin || false;
    
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
    await this.findByUserAndGroupId(userId, groupId); // 존재 확인
    await this.groupMemberRepository.delete(userId, groupId);
  }
}
