import { Injectable, NotFoundException, Inject, BadRequestException, ConflictException } from '@nestjs/common';
import { IBusSeatRepository } from '../domain/bus-seat.repository.interface';
import { BusSeat } from '../domain/bus-seat.entity';
import { CreateBusSeatDto } from './dto/create-bus-seat.dto';
import { UpdateBusSeatDto } from './dto/update-bus-seat.dto';
import { AssignSeatDto } from './dto/assign-seat.dto';
import { BatchCreateSeatsDto } from './dto/batch-create-seats.dto';
import { BusTemplateService } from '../../bus-templates/application/bus-template.service';
import { UserService } from '../../users/application/user.service';
import { ScheduleService } from '../../schedules/application/schedule.service';

@Injectable()
export class BusSeatService {
  constructor(
    @Inject('IBusSeatRepository')
    private readonly busSeatRepository: IBusSeatRepository,
    private readonly busTemplateService: BusTemplateService,
    private readonly userService: UserService,
    private readonly scheduleService: ScheduleService,
  ) {}

  async findAll(): Promise<BusSeat[]> {
    return this.busSeatRepository.findAll();
  }

  async findById(id: string): Promise<BusSeat> {
    const busSeat = await this.busSeatRepository.findById(id);
    if (!busSeat) {
      throw new NotFoundException(`버스 좌석 ID ${id}를 찾을 수 없습니다.`);
    }
    return busSeat;
  }

  async findBySchedule(scheduleId: string): Promise<BusSeat[]> {
    // 스케줄 존재 확인
    await this.scheduleService.findById(scheduleId);
    return this.busSeatRepository.findBySchedule(scheduleId);
  }

  async findByBusTemplate(busTemplateId: string): Promise<BusSeat[]> {
    // 버스 템플릿 존재 확인
    await this.busTemplateService.findById(busTemplateId);
    return this.busSeatRepository.findByBusTemplate(busTemplateId);
  }

  async findByScheduleAndBusTemplate(scheduleId: string, busTemplateId: string): Promise<BusSeat[]> {
    // 스케줄 존재 확인
    await this.scheduleService.findById(scheduleId);
    // 버스 템플릿 존재 확인
    await this.busTemplateService.findById(busTemplateId);
    return this.busSeatRepository.findByScheduleAndBusTemplate(scheduleId, busTemplateId);
  }

  async findByUser(userId: string): Promise<BusSeat[]> {
    // 사용자 존재 확인
    await this.userService.findById(userId);
    return this.busSeatRepository.findByUser(userId);
  }

  async findByUserAndSchedule(userId: string, scheduleId: string): Promise<BusSeat | null> {
    // 사용자 존재 확인
    await this.userService.findById(userId);
    // 스케줄 존재 확인
    await this.scheduleService.findById(scheduleId);
    return this.busSeatRepository.findByUserAndSchedule(userId, scheduleId);
  }

  async create(createBusSeatDto: CreateBusSeatDto): Promise<BusSeat> {
    // 버스 템플릿 존재 확인
    await this.busTemplateService.findById(createBusSeatDto.busTemplateId);
    
    // 스케줄 존재 확인 (있는 경우)
    if (createBusSeatDto.scheduleId) {
      await this.scheduleService.findById(createBusSeatDto.scheduleId);
    }
    
    // 사용자 존재 확인 (있는 경우)
    if (createBusSeatDto.userId) {
      await this.userService.findById(createBusSeatDto.userId);
    }
    
    const busSeat = new BusSeat();
    busSeat.seatNumber = createBusSeatDto.seatNumber;
    busSeat.seatLabel = createBusSeatDto.seatLabel || `좌석 ${createBusSeatDto.seatNumber}`;
    busSeat.rowPosition = createBusSeatDto.rowPosition;
    busSeat.columnPosition = createBusSeatDto.columnPosition;
    busSeat.busTemplateId = createBusSeatDto.busTemplateId;
    busSeat.scheduleId = createBusSeatDto.scheduleId || null;
    busSeat.userId = createBusSeatDto.userId || null;
    busSeat.status = createBusSeatDto.status || (createBusSeatDto.userId ? 'assigned' : 'empty');
    
    return this.busSeatRepository.create(busSeat);
  }

  async update(id: string, updateBusSeatDto: UpdateBusSeatDto): Promise<BusSeat> {
    const busSeat = await this.findById(id);
    
    // 버스 템플릿 존재 확인 (변경되는 경우)
    if (updateBusSeatDto.busTemplateId && updateBusSeatDto.busTemplateId !== busSeat.busTemplateId) {
      await this.busTemplateService.findById(updateBusSeatDto.busTemplateId);
    }
    
    // 스케줄 존재 확인 (변경되는 경우)
    if (updateBusSeatDto.scheduleId && updateBusSeatDto.scheduleId !== busSeat.scheduleId) {
      await this.scheduleService.findById(updateBusSeatDto.scheduleId);
    }
    
    // 사용자 존재 확인 (변경되는 경우)
    if (updateBusSeatDto.userId && updateBusSeatDto.userId !== busSeat.userId) {
      await this.userService.findById(updateBusSeatDto.userId);
    }
    
    if (updateBusSeatDto.seatNumber !== undefined) busSeat.seatNumber = updateBusSeatDto.seatNumber;
    if (updateBusSeatDto.seatLabel !== undefined) busSeat.seatLabel = updateBusSeatDto.seatLabel;
    if (updateBusSeatDto.rowPosition !== undefined) busSeat.rowPosition = updateBusSeatDto.rowPosition;
    if (updateBusSeatDto.columnPosition !== undefined) busSeat.columnPosition = updateBusSeatDto.columnPosition;
    if (updateBusSeatDto.busTemplateId !== undefined) busSeat.busTemplateId = updateBusSeatDto.busTemplateId;
    if (updateBusSeatDto.scheduleId !== undefined) busSeat.scheduleId = updateBusSeatDto.scheduleId;
    if (updateBusSeatDto.userId !== undefined) {
      busSeat.userId = updateBusSeatDto.userId;
      
      // 사용자가 지정되면 상태를 assigned로 변경
      if (updateBusSeatDto.userId && !updateBusSeatDto.status) {
        busSeat.status = 'assigned';
      }
      // 사용자가 제거되면 상태를 empty로 변경
      else if (!updateBusSeatDto.userId && !updateBusSeatDto.status) {
        busSeat.status = 'empty';
      }
    }
    if (updateBusSeatDto.status !== undefined) busSeat.status = updateBusSeatDto.status;
    
    const updatedBusSeat = await this.busSeatRepository.update(id, busSeat);
    if (!updatedBusSeat) {
      throw new NotFoundException(`버스 좌석 ID ${id} 업데이트에 실패했습니다.`);
    }
    
    return updatedBusSeat;
  }

  async remove(id: string): Promise<void> {
    await this.findById(id); // 존재 확인
    await this.busSeatRepository.delete(id);
  }

  async assignSeat(assignSeatDto: AssignSeatDto): Promise<BusSeat> {
    const { userId, seatId, busTemplateId } = assignSeatDto;
    
    // 사용자 존재 확인
    await this.userService.findById(userId);
    
    // 좌석 존재 확인
    const seat = await this.findById(seatId);
    
    // 버스 템플릿 일치 확인
    if (seat.busTemplateId !== busTemplateId) {
      throw new BadRequestException('좌석이 지정된 버스 템플릿에 속하지 않습니다.');
    }
    
    // 좌석이 이미 할당되어 있는지 확인
    if (seat.userId && seat.userId !== userId) {
      throw new ConflictException('이미 다른 사용자에게 할당된 좌석입니다.');
    }
    
    // 이미 같은 사용자가 배정되어 있는 경우 바로 반환
    if (seat.userId === userId) {
      return seat;
    }
    
    // 현재 사용자가 같은 스케줄에 다른 좌석을 가지고 있는 경우 해제
    if (seat.scheduleId) {
      const existingSeat = await this.busSeatRepository.findByUserAndSchedule(userId, seat.scheduleId);
      if (existingSeat && existingSeat.id !== seatId) {
        // 기존 좌석 해제
        existingSeat.userId = null;
        existingSeat.status = 'empty';
        await this.busSeatRepository.update(existingSeat.id, existingSeat);
      }
    }
    
    // 좌석 할당
    seat.userId = userId;
    seat.status = 'assigned';
    
    const updatedBusSeat = await this.busSeatRepository.update(seatId, seat);
    if (!updatedBusSeat) {
      throw new NotFoundException(`좌석 ID ${seatId} 업데이트에 실패했습니다.`);
    }
    
    return updatedBusSeat as BusSeat;
  }

  async batchCreateSeats(batchCreateSeatsDto: BatchCreateSeatsDto): Promise<BusSeat[]> {
    const { busTemplateId, scheduleId, rows, seatsPerRow, hasAisle } = batchCreateSeatsDto;
    
    // 버스 템플릿 존재 확인
    await this.busTemplateService.findById(busTemplateId);
    
    // 스케줄 존재 확인
    await this.scheduleService.findById(scheduleId);
    
    // 해당 스케줄과 버스 템플릿에 이미 좌석이 존재하는지 확인
    const existingSeats = await this.busSeatRepository.findByScheduleAndBusTemplate(scheduleId, busTemplateId);
    if (existingSeats.length > 0) {
      // 기존 좌석 삭제
      await Promise.all(existingSeats.map(seat => this.busSeatRepository.delete(seat.id)));
    }
    
    // 새 좌석 생성
    const newSeats: BusSeat[] = [];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < seatsPerRow; col++) {
        // 통로를 위한 위치 계산
        if (hasAisle && col === Math.floor(seatsPerRow / 2)) {
          continue; // 통로 위치는 건너뜀
        }
        
        const seatNumber = row * seatsPerRow + col + 1;
        
        const busSeat = new BusSeat();
        busSeat.seatNumber = seatNumber;
        busSeat.seatLabel = `좌석 ${seatNumber}`;
        busSeat.rowPosition = row;
        busSeat.columnPosition = col;
        busSeat.busTemplateId = busTemplateId;
        busSeat.scheduleId = scheduleId;
        busSeat.status = 'empty';
        
        newSeats.push(busSeat);
      }
    }
    
    return this.busSeatRepository.bulkCreate(newSeats);
  }

  async deleteBySchedule(scheduleId: string): Promise<void> {
    // 스케줄 존재 확인
    await this.scheduleService.findById(scheduleId);
    await this.busSeatRepository.deleteBySchedule(scheduleId);
  }

  async deleteByBusTemplate(busTemplateId: string): Promise<void> {
    // 버스 템플릿 존재 확인
    await this.busTemplateService.findById(busTemplateId);
    await this.busSeatRepository.deleteByBusTemplate(busTemplateId);
  }
}
