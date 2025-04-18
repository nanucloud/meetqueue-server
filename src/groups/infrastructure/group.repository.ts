import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Group } from '../domain/group.entity';
import { IGroupRepository } from '../domain/group.repository.interface';

@Injectable()
export class GroupRepository implements IGroupRepository {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
  ) {}

  async findAll(): Promise<Group[]> {
    return this.groupRepository.find();
  }

  async findById(id: string): Promise<Group | null> {
    return this.groupRepository.findOneBy({ groupId: id });
  }

  async findByInviteId(id: string): Promise<Group | null> {
    return this.groupRepository.findOneBy({ inviteCode: id });
  }


  async findByKeyword(keyword: string): Promise<Group[]> {
    return this.groupRepository.find({
      where: [
        { groupName: Like(`%${keyword}%`) },
        { description: Like(`%${keyword}%`) }
      ]
    });
  }

  async findPublicGroups(): Promise<Group[]> {
    return this.groupRepository.find({
      where: { isPublic: true }
    });
  }

  async create(group: Group): Promise<Group> {
    return this.groupRepository.save(group);
  }

  async update(id: string, groupData: Partial<Group>): Promise<Group | null> {
    await this.groupRepository.update({ groupId: id }, groupData);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.groupRepository.delete({ groupId: id });
  }
}