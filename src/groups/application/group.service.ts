import { Inject, Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { IGroupRepository } from '../domain/group.repository.interface';
import { Group } from '../domain/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupWithAdminStatusDto } from './dto/group-with-admin-status.dto';
import { GroupMemberService } from './group-member.service';
import { GroupMember } from '../domain/group-member.entity';
import { IGroupMemberRepository } from '../domain/group-member.repository.interface';
import { JoinGroupDto } from './dto/join-group.dto';
import { SearchGroupDto } from './dto/search-group.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';

@Injectable()
export class GroupService {
  constructor(
    @Inject('IGroupRepository')
    private readonly groupRepository: IGroupRepository,
    private readonly groupMemberService: GroupMemberService,
    @Inject('IGroupMemberRepository')
    private readonly groupMemberRepository: IGroupMemberRepository,
  ) {}

  /**
   * 사용자의 그룹 목록을 관리자 상태와 함께 조회
   * @param userId 사용자 ID
   * @returns 사용자의 그룹 목록 (관리자 상태 포함)
   */
  async findUserGroups(userId: string): Promise<GroupWithAdminStatusDto[]> {
    // 사용자의 멤버십 조회
    const userMemberships = await this.groupMemberService.findMembers({ userId });
    
    if (userMemberships.length === 0) {
      return [];
    }

    // 멤버십의 그룹 ID 추출
    const groupIds = userMemberships.map((membership) => membership.groupId);

    // 그룹 정보 조회 (존재하는 그룹만)
    const groupPromises = groupIds.map((id) => 
      this.findByIdOrNull(id)
    );
    const groups = await Promise.all(groupPromises);
    const validGroups = groups.filter((group): group is Group => group !== null);

    // 관리자 상태 매핑
    const adminStatusMap = userMemberships.reduce((map, membership) => {
      map[membership.groupId] = membership.isAdmin;
      return map;
    }, {} as Record<string, boolean>);

    // DTO 변환
    return validGroups.map((group) => {
      const isAdmin = adminStatusMap[group.groupId] === true;
      return new GroupWithAdminStatusDto(group, isAdmin);
    });
  }

  /**
   * ID로 그룹 조회 (존재하지 않으면 null 반환)
   * @param id 그룹 ID
   * @returns 그룹 또는 null
   */
  async findByIdOrNull(id: string): Promise<Group | null> {
    return this.groupRepository.findById(id);
  }

  /**
   * ID로 그룹 조회 (존재하지 않으면 예외)
   * @param id 그룹 ID
   * @returns 그룹
   * @throws NotFoundException
   */
  async findById(id: string): Promise<Group> {
    const group = await this.findByIdOrNull(id);
    if (!group) {
      throw new NotFoundException(`그룹 ID ${id}를 찾을 수 없습니다.`);
    }
    return group;
  }

  /**
   * 그룹 상세 정보와 사용자의 관리자 상태 조회
   * @param id 그룹 ID
   * @param userId 사용자 ID
   * @returns 그룹 상세 정보 (관리자 상태 포함)
   */
  async findByIdWithAdminStatus(
    id: string,
    userId: string,
  ): Promise<GroupWithAdminStatusDto> {
    const group = await this.findById(id);

    // 관리자 상태 확인
    const membership = await this.groupMemberService.findByUserAndGroupIdOrNull(userId, id);
    const isAdmin = membership?.isAdmin ?? false;

    return new GroupWithAdminStatusDto(group, isAdmin);
  }

  /**
   * 그룹 생성 및 생성자를 관리자로 설정
   * @param createGroupDto 그룹 생성 DTO
   * @param userId 생성자 ID
   * @returns 생성된 그룹
   */
  /**
   * 공개 그룹 목록 조회
   */
  async findPublicGroups(): Promise<Group[]> {
    return this.groupRepository.findPublicGroups();
  }

  /**
   * 키워드로 그룹 검색
   */
  async searchGroups(searchDto: SearchGroupDto): Promise<Group[]> {
    if (searchDto.keyword) {
      return this.groupRepository.findByKeyword(searchDto.keyword);
    }
    return this.findPublicGroups();
  }

  /**
   * 8자리 초대 코드 생성
   */
  private generateInviteCode(): string {
    return Math.floor(10000000 + Math.random() * 90000000).toString().substring(0, 8);
  }

  async create(
    createGroupDto: CreateGroupDto,
    userId: string,
  ): Promise<Group> {
    // 그룹 생성
    const group = new Group();
    group.groupName = createGroupDto.groupName;
    group.isPublic = createGroupDto.isPublic || false;
    group.description = createGroupDto.description || '';
    group.inviteCode = this.generateInviteCode();
    
    const createdGroup = await this.groupRepository.create(group);

    // 생성자를 관리자로 추가
    const member = new GroupMember();
    member.UUID = userId;
    member.groupId = createdGroup.groupId;
    member.isAdmin = true;
    await this.groupMemberRepository.create(member);

    return createdGroup;
  }

  /**
   * 그룹 관리자 권한 검증
   * @param groupId 그룹 ID
   * @param userId 사용자 ID
   * @throws ForbiddenException
   */
  async validateGroupAdmin(groupId: string, userId: string): Promise<void> {
    const membership = await this.groupMemberService.findByUserAndGroupIdOrNull(userId, groupId);
    
    if (!membership || !membership.isAdmin) {
      throw new ForbiddenException('그룹 관리자만 이 작업을 수행할 수 있습니다.');
    }
  }
  
  /**
   * 그룹 참가 (초대 코드 필요)
   */
  async joinGroup(joinGroupDto: JoinGroupDto, userId: string): Promise<Group> {
    const { groupId, inviteCode } = joinGroupDto;
    
    // 1. 그룹 존재 확인
    const group = await this.findById(groupId);
    
    // 2. 이미 회원인지 확인
    const existingMembership = await this.groupMemberService.findByUserAndGroupIdOrNull(userId, groupId);
    if (existingMembership) {
      throw new ConflictException('이미 그룹의 회원입니다.');
    }
    
    // 3. 그룹이 공개되지 않은 경우 초대 코드 확인
    if (!group.isPublic) {
      if (inviteCode !== group.inviteCode) {
        throw new BadRequestException('잘못된 초대 코드입니다.');
      }
    }
    
    // 4. 회원 추가
    const member = new GroupMember();
    member.UUID = userId;
    member.groupId = groupId;
    member.isAdmin = false; // 기본적으로 일반 회원으로 추가
    await this.groupMemberRepository.create(member);
    
    return group;
  }
  
  /**
   * 회원 관리자 역할 업데이트
   */
  async updateMemberRole(groupId: string, updateRoleDto: UpdateMemberRoleDto, adminUserId: string): Promise<void> {
    // 1. 현재 사용자가 그룹 관리자인지 확인
    await this.validateGroupAdmin(groupId, adminUserId);
    
    // 2. 대상 회원이 존재하는지 확인
    const targetMembership = await this.groupMemberService.findByUserAndGroupIdOrNull(updateRoleDto.userId, groupId);
    if (!targetMembership) {
      throw new NotFoundException('관리할 회원을 찾을 수 없습니다.');
    }
    
    // 3. 역할 업데이트
    await this.groupMemberService.update(updateRoleDto.userId, groupId, {
      isAdmin: updateRoleDto.isAdmin
    });
  }
  
  /**
   * 회원 추방 (kick)
   */
  async removeMember(groupId: string, memberUserId: string, adminUserId: string): Promise<void> {
    // 1. 현재 사용자가 그룹 관리자인지 확인
    await this.validateGroupAdmin(groupId, adminUserId);
    
    // 2. 자기 자신을 추방하는 경우 방지
    if (memberUserId === adminUserId) {
      throw new BadRequestException('자기 자신을 추방할 수 없습니다. 그룹을 떠나려면 퇴장 기능을 사용하세요.');
    }
    
    // 3. 대상 회원이 존재하는지 확인
    const targetMembership = await this.groupMemberService.findByUserAndGroupIdOrNull(memberUserId, groupId);
    if (!targetMembership) {
      throw new NotFoundException('추방할 회원을 찾을 수 없습니다.');
    }
    
    // 4. 대상 회원이 이미 관리자인 경우 방지 (관리자는 다른 관리자가 추방 불가)
    if (targetMembership.isAdmin) {
      throw new ForbiddenException('다른 관리자를 추방할 수 없습니다.');
    }
    
    // 5. 회원 삭제
    await this.groupMemberService.remove(memberUserId, groupId);
  }
  
  /**
   * 그룹 퇴장 (leave)
   */
  async leaveGroup(groupId: string, userId: string): Promise<void> {
    // 1. 회원인지 확인
    const membership = await this.groupMemberService.findByUserAndGroupIdOrNull(userId, groupId);
    if (!membership) {
      throw new NotFoundException('그룹의 회원이 아닙니다.');
    }
    
    // 2. 마지막 관리자인 경우에는 퇴장 불가
    if (membership.isAdmin) {
      const admins = await this.groupMemberRepository.findAdminsByGroupId(groupId);
      if (admins.length <= 1) {
        throw new BadRequestException('마지막 관리자는 그룹을 퇴장할 수 없습니다. 다른 회원을 관리자로 지정하거나 그룹을 삭제하세요.');
      }
    }
    
    // 3. 회원 삭제
    await this.groupMemberService.remove(userId, groupId);
  }

  /**
   * 그룹 정보 업데이트
   * @param id 그룹 ID
   * @param updateGroupDto 그룹 업데이트 DTO
   * @param userId 요청 사용자 ID
   * @returns 업데이트된 그룹
   */
  async update(
    id: string, 
    updateGroupDto: UpdateGroupDto, 
    userId: string
  ): Promise<Group> {
    // 관리자 권한 검증
    await this.validateGroupAdmin(id, userId);
    
    // 그룹 조회
    const group = await this.findById(id);

    // 업데이트 로직
    if (updateGroupDto.groupName) {
      group.groupName = updateGroupDto.groupName;
    }
    
    if (updateGroupDto.isPublic !== undefined) {
      group.isPublic = updateGroupDto.isPublic;
    }
    
    if (updateGroupDto.description !== undefined) {
      group.description = updateGroupDto.description;
    }
    
    // 초대 코드 재생성을 요청한 경우
    if (updateGroupDto.regenerateInviteCode) {
      group.inviteCode = this.generateInviteCode();
    }

    // 업데이트 시도
    const updatedGroup = await this.groupRepository.update(id, group);
    if (!updatedGroup) {
      throw new NotFoundException(`그룹 ID ${id} 업데이트에 실패했습니다.`);
    }

    return updatedGroup;
  }

  /**
   * 그룹 삭제
   * @param id 그룹 ID
   * @param userId 요청 사용자 ID
   */
  async remove(id: string, userId: string): Promise<void> {
    // 관리자 권한 검증
    await this.validateGroupAdmin(id, userId);
    
    // 그룹 존재 확인
    await this.findById(id);
    
    // 삭제 수행
    await this.groupRepository.delete(id);
  }
}