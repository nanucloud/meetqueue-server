import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { GroupService } from '../application/group.service';
import { CreateGroupDto } from '../application/dto/create-group.dto';
import { UpdateGroupDto } from '../application/dto/update-group.dto';
import { Group } from '../domain/group.entity';
import { GroupWithAdminStatusDto } from '../application/dto/group-with-admin-status.dto';
import { AccessTokenGuard } from '../../auth/infrastructure/access-token.guard';
import { Roles, Role } from '../../auth/infrastructure/roles.decorator';
import { RolesGuard } from '../../auth/infrastructure/roles.guard';
import { Request } from 'express';
import { JoinGroupDto } from '../application/dto/join-group.dto';
import { SearchGroupDto } from '../application/dto/search-group.dto';
import { UpdateMemberRoleDto } from '../application/dto/update-member-role.dto';

interface CustomRequest extends Request {
  user?: { userId: string };
}

@Controller('groups')
@UseGuards(AccessTokenGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get()
  async findAll(@Req() req: CustomRequest): Promise<GroupWithAdminStatusDto[]> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('사용자 인증 정보가 없습니다.');
    }
    return this.groupService.findUserGroups(userId);
  }
  
  @Get('public')
  async findPublicGroups(): Promise<Group[]> {
    return this.groupService.findPublicGroups();
  }
  
  @Get('search')
  async searchGroups(@Query() searchParams: SearchGroupDto): Promise<Group[]> {
    return this.groupService.searchGroups(searchParams);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: CustomRequest,
  ): Promise<GroupWithAdminStatusDto> {
    const userId = req.user?.userId;
    if (!userId) {
      const group = await this.groupService.findById(id);
      return new GroupWithAdminStatusDto(group, false);
    }
    return this.groupService.findByIdWithAdminStatus(id, userId);
  }

  @Post()
  async create(
    @Body() createGroupDto: CreateGroupDto, 
    @Req() req: CustomRequest
  ): Promise<Group> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('사용자 인증 정보가 없습니다.');
    }
    return this.groupService.create(createGroupDto, userId);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @Req() req: CustomRequest,
  ): Promise<Group> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('사용자 인증 정보가 없습니다.');
    }
    return this.groupService.update(id, updateGroupDto, userId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  async remove(
    @Param('id') id: string,
    @Req() req: CustomRequest,
  ): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('사용자 인증 정보가 없습니다.');
    }
    return this.groupService.remove(id, userId);
  }
  
  @Post('join')
  async joinGroup(
    @Body() joinGroupDto: JoinGroupDto,
    @Req() req: CustomRequest,
  ): Promise<Group> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('사용자 인증 정보가 없습니다.');
    }
    return this.groupService.joinGroup(joinGroupDto, userId);
  }
  
  @Post(':groupId/members/role')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateMemberRole(
    @Param('groupId') groupId: string,
    @Body() updateRoleDto: UpdateMemberRoleDto,
    @Req() req: CustomRequest,
  ): Promise<void> {
    const adminUserId = req.user?.userId;
    if (!adminUserId) {
      throw new Error('사용자 인증 정보가 없습니다.');
    }
    return this.groupService.updateMemberRole(groupId, updateRoleDto, adminUserId);
  }
  
  @Delete(':groupId/members/:userId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async kickMember(
    @Param('groupId') groupId: string,
    @Param('userId') memberUserId: string,
    @Req() req: CustomRequest,
  ): Promise<void> {
    const adminUserId = req.user?.userId;
    if (!adminUserId) {
      throw new Error('사용자 인증 정보가 없습니다.');
    }
    return this.groupService.removeMember(groupId, memberUserId, adminUserId);
  }
  
  @Delete(':groupId/leave')
  async leaveGroup(
    @Param('groupId') groupId: string,
    @Req() req: CustomRequest,
  ): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('사용자 인증 정보가 없습니다.');
    }
    return this.groupService.leaveGroup(groupId, userId);
  }
}