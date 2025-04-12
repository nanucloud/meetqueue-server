import { Injectable, CanActivate, ExecutionContext, Inject, forwardRef } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, ROLES_KEY } from './roles.decorator';
import { GroupMemberService } from '../../groups/application/group-member.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(forwardRef(() => GroupMemberService))
    private groupMemberService: GroupMemberService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user, params } = context.switchToHttp().getRequest();
    
    // 기본적인 역할 체크
    if (requiredRoles.includes(Role.USER)) {
      return true; // 인증된 사용자라면 기본 USER 역할 부여
    }
    
    // 그룹 관리자 권한 체크
    if (requiredRoles.includes(Role.ADMIN) && params.groupId) {
      try {
        const membership = await this.groupMemberService.findByUserAndGroupId(user.userId, params.groupId);
        return membership && membership.isAdmin;
      } catch (error) {
        return false;
      }
    }
    
    // TEACHER, STUDENT 등 다른 역할 체크 로직도 추가 가능
    
    return false;
  }
}
