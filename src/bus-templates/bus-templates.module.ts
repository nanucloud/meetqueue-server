import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusTemplate } from './domain/bus-template.entity';
import { BusTemplateService } from './application/bus-template.service';
import { BusTemplateController } from './interface/bus-template.controller';
import { BusTemplateRepository } from './infrastructure/bus-template.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([BusTemplate])
  ],
  controllers: [BusTemplateController],
  providers: [
    BusTemplateService,
    {
      provide: 'IBusTemplateRepository',
      useClass: BusTemplateRepository,
    },
  ],
  exports: [BusTemplateService],
})
export class BusTemplatesModule {}
