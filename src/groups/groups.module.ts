import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './domain/group.entity';
import { GroupMember } from './domain/group-member.entity';
import { GroupRepository } from './infrastructure/group.repository';
import { GroupMemberRepository } from './infrastructure/group-member.repository';
import { GroupService } from './application/group.service';
import { GroupMemberService } from './application/group-member.service';
import { GroupController } from './interface/group.controller';
import { GroupMemberController } from './interface/group-member.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Group, GroupMember])],
  controllers: [GroupController, GroupMemberController],
  providers: [
    GroupService,
    GroupMemberService,
    {
      provide: 'IGroupRepository',
      useClass: GroupRepository,
    },
    {
      provide: 'IGroupMemberRepository',
      useClass: GroupMemberRepository,
    },
  ],
  exports: [GroupService, GroupMemberService],
})
export class GroupsModule {}
