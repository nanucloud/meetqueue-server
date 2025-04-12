import { Group } from './group.entity';

export interface IGroupRepository {
  findAll(): Promise<Group[]>;
  findById(id: string): Promise<Group | null>;
  create(group: Group): Promise<Group>;
  update(id: string, group: Partial<Group>): Promise<Group | null>;
  delete(id: string): Promise<void>;
}
