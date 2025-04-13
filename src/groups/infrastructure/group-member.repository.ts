import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupMember } from '../domain/group-member.entity';
import { IGroupMemberRepository } from '../domain/group-member.repository.interface';

@Injectable()
export class GroupMemberRepository implements IGroupMemberRepository {
  constructor(
    @InjectRepository(GroupMember)
    private groupMemberRepository: Repository<GroupMember>,
  ) {}

  async findAll(): Promise<GroupMember[]> {
    return this.groupMemberRepository.find();
  }

  async findByGroupId(groupId: string): Promise<GroupMember[]> {
    return this.groupMemberRepository.find({
      where: { groupId },
      relations: ['user'],
    });
  }

  async findByUserId(userId: string): Promise<GroupMember[]> {
    return this.groupMemberRepository.find({
      where: { UUID: userId },
      relations: ['group'],
    });
  }

  async findByUserAndGroupId(userId: string, groupId: string): Promise<GroupMember | null> {
    return this.groupMemberRepository.findOne({
      where: { UUID: userId, groupId },
      relations: ['user', 'group'],
    });
  }

  async findAdminsByGroupId(groupId: string): Promise<GroupMember[]> {
    return this.groupMemberRepository.find({
      where: { 
        groupId,
        isAdmin: true 
      },
      relations: ['user'],
    });
  }

  async create(groupMember: GroupMember): Promise<GroupMember> {
    return this.groupMemberRepository.save(groupMember);
  }

  async update(
    userId: string,
    groupId: string,
    groupMemberData: Partial<GroupMember>,
  ): Promise<GroupMember | null> {
    await this.groupMemberRepository.update(
      { UUID: userId, groupId },
      groupMemberData,
    );
    return this.findByUserAndGroupId(userId, groupId);
  }

  async delete(userId: string, groupId: string): Promise<void> {
    await this.groupMemberRepository.delete({ UUID: userId, groupId });
  }
}