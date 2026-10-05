import { Module } from '@nestjs/common';
import { EcoDesignController } from './eco-design.controller';
import { EcoDesignService } from './eco-design.service';

@Module({
  controllers: [EcoDesignController],
  providers: [EcoDesignService],
  exports: [EcoDesignService],
})
export class EcoDesignModule {}
