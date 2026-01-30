import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './match.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
  ) {}

  async create(createMatchDto: CreateMatchDto): Promise<Match> {
    const match = this.matchRepository.create(createMatchDto);
    return await this.matchRepository.save(match);
  }

  async findAll(): Promise<Match[]> {
    return await this.matchRepository.find({
      relations: ['session', 'player1', 'player2'],
    });
  }

  async findOne(id: string): Promise<Match | null> {
    return await this.matchRepository.findOne({
      where: { id },
      relations: ['session', 'player1', 'player2'],
    });
  }

  async findBySession(session_id: string): Promise<Match[]> {
    return await this.matchRepository.find({
      where: { session_id },
      relations: ['player1', 'player2'],
    });
  }

  async update(id: string, updateMatchDto: UpdateMatchDto): Promise<Match | null> {
    await this.matchRepository.update(id, updateMatchDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.matchRepository.delete(id);
  }
}
