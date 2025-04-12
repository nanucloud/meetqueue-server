import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BusSeat } from '../../bus-seats/domain/bus-seat.entity';

@Entity('tbl_bus_template')
export class BusTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'int' })
  rows: number;

  @Column({ type: 'int' })
  seatsPerRow: number;

  @Column({ type: 'int' })
  totalSeats: number;

  @Column({ type: 'boolean', default: true })
  hasAisle: boolean;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @OneToMany(() => BusSeat, busSeat => busSeat.busTemplate)
  seats: BusSeat[];
}
