import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IGroupRepository } from '../domain/group.repository.interface';
import { Group } from '../domain/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupService {
  constructor(
    @Inject('IGroupRepository')
    private readonly groupRepository: IGroupRepository,
  ) {}

  async findAll(): Promise<Group[]> {
    return this.groupRepository.findAll();
  }

  async findById(id: string): Promise<Group> {
    const group = await this.groupRepository.findById(id);
    if (!group) {
      throw new NotFoundException(`그룹 ID ${id}를 찾을 수 없습니다.`);
    }
    return group;
  }

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    const group = new Group();
    group.groupName = createGroupDto.groupName;
    
    return this.groupRepository.create(group);
  }

  async update(id: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const group = await this.findById(id);
    
    if (updateGroupDto.groupName) {
      group.groupName = updateGroupDto.groupName;
    }
    
    const updatedGroup = await this.groupRepository.update(id, group);
    if (!updatedGroup) {
      throw new NotFoundException(`그룹 ID ${id} 업데이트에 실패했습니다.`);
    }
    
    return updatedGroup;
  }

  async remove(id: string): Promise<void> {
    await this.findById(id); // 존재 확인
    await this.groupRepository.delete(id);
  }
}
