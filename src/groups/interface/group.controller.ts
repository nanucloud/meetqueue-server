import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { GroupService } from '../application/group.service';
import { CreateGroupDto } from '../application/dto/create-group.dto';
import { UpdateGroupDto } from '../application/dto/update-group.dto';
import { Group } from '../domain/group.entity';
import { AccessTokenGuard } from '../../auth/infrastructure/access-token.guard';
import { Roles, Role } from '../../auth/infrastructure/roles.decorator';
import { RolesGuard } from '../../auth/infrastructure/roles.guard';
import { CurrentUser } from '../../auth/infrastructure/current-user.decorator';

@Controller('groups')
@UseGuards(AccessTokenGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get()
  async findAll(): Promise<Group[]> {
    return this.groupService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Group> {
    return this.groupService.findById(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async create(@Body() createGroupDto: CreateGroupDto, @CurrentUser('userId') userId: string): Promise<Group> {
    return this.groupService.create(createGroupDto);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @CurrentUser('userId') userId: string,
  ): Promise<Group> {
    return this.groupService.update(id, updateGroupDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string, @CurrentUser('userId') userId: string): Promise<void> {
    return this.groupService.remove(id);
  }
}
