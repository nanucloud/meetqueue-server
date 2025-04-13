import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { GroupMemberService } from '../application/group-member.service';
import { CreateGroupMemberDto } from '../application/dto/create-group-member.dto';
import { UpdateGroupMemberDto } from '../application/dto/update-group-member.dto';
import { GroupMember } from '../domain/group-member.entity';
import { GroupMemberInfoDto } from '../application/dto/group-member-info.dto';

@Controller('group-members')
export class GroupMemberController {
  constructor(private readonly groupMemberService: GroupMemberService) {}

  @Get()
  async findAll(): Promise<GroupMemberInfoDto[]> {
    return this.groupMemberService.findMembers();
  }

  @Get('group/:groupId')
  async findByGroupId(@Param('groupId') groupId: string): Promise<GroupMemberInfoDto[]> {
    return this.groupMemberService.findMembers({ groupId });
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string): Promise<GroupMemberInfoDto[]> {
    return this.groupMemberService.findMembers({ userId });
  }

  @Get(':userId/:groupId')
  async findOne(
    @Param('userId') userId: string,
    @Param('groupId') groupId: string,
  ): Promise<GroupMember> {
    return this.groupMemberService.findByUserAndGroupId(userId, groupId);
  }

  @Post()
  async create(@Body() createGroupMemberDto: CreateGroupMemberDto): Promise<GroupMember> {
    return this.groupMemberService.create(createGroupMemberDto);
  }

  @Put(':userId/:groupId')
  async update(
    @Param('userId') userId: string,
    @Param('groupId') groupId: string,
    @Body() updateGroupMemberDto: UpdateGroupMemberDto,
  ): Promise<GroupMember> {
    return this.groupMemberService.update(userId, groupId, updateGroupMemberDto);
  }

  @Delete(':userId/:groupId')
  async remove(
    @Param('userId') userId: string,
    @Param('groupId') groupId: string,
  ): Promise<void> {
    return this.groupMemberService.remove(userId, groupId);
  }
}