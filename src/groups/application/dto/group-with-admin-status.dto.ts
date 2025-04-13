import { Group } from '../../domain/group.entity';

export class GroupWithAdminStatusDto {
  id: string;
  groupName: string;
  isAdmin: boolean;

  constructor(group: Group, isAdmin: boolean) {
    this.id = group.groupId;
    this.groupName = group.groupName;
    this.isAdmin = isAdmin;
  }
}
