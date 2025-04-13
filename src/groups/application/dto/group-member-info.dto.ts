export class GroupMemberInfoDto {
  constructor(
    public userId: string,
    public userName: string,
    public isAdmin: boolean,
    public groupId: string,
  ) {}
}
