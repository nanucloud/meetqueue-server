import { BusTemplate } from './bus-template.entity';

export interface IBusTemplateRepository {
  findAll(): Promise<BusTemplate[]>;
  findById(id: string): Promise<BusTemplate | null>;
  create(busTemplate: BusTemplate): Promise<BusTemplate>;
  update(id: string, busTemplate: BusTemplate): Promise<BusTemplate | null>;
  delete(id: string): Promise<void>;
}
