import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from '../match/match.entity';
import { RouletteController } from './roulette.controller';
import { RouletteService } from './roulette.service';

@Module({
  imports: [TypeOrmModule.forFeature([Match])],
  controllers: [RouletteController],
  providers: [RouletteService],
  exports: [RouletteService],
})
export class RouletteModule {}
