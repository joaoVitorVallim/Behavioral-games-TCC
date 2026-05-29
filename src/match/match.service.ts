import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match, MatchStatus } from './match.entity';
import { CreateMatchDto } from './dto/create-match.dto';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
  ) {}

  async create(dto: CreateMatchDto): Promise<Match> {
    const match = this.matchRepository.create({
      session_id: dto.sessionId,
      player1_id: dto.player1Id,
      player2_id: dto.player2Id ?? null,
      moves: dto.moves ?? {},
      status: dto.status ?? MatchStatus.AGUARDANDO,
      matchTime: dto.matchTime,
    });

    return await this.matchRepository.save(match);
  }

  async findAll(filters?: { sessionId?: string; status?: MatchStatus; playerId?: string }): Promise<Match[]> {
    const query = this.matchRepository.createQueryBuilder('match');

    if (filters?.sessionId) {
      query.andWhere('match.session_id = :sessionId', { sessionId: filters.sessionId });
    }

    if (filters?.status) {
      query.andWhere('match.status = :status', { status: filters.status });
    }

    if (filters?.playerId) {
      query.andWhere(
        '(match.player1_id = :playerId OR match.player2_id = :playerId)',
        { playerId: filters.playerId },
      );
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<Match | null> {
    return await this.matchRepository.findOne({ where: { id } });
  }

  async update(id: string, updates: Partial<Match>): Promise<Match> {
    await this.matchRepository.update(id, updates);
    const updatedMatch = await this.matchRepository.findOne({ where: { id } });
    if (!updatedMatch) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    return updatedMatch;
  }

  async updateStatus(id: string, status: MatchStatus): Promise<Match> {
    await this.matchRepository.update(id, { status });
    const updatedMatch = await this.matchRepository.findOne({ where: { id } });
    if (!updatedMatch) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    return updatedMatch;
  }

  async delete(id: string): Promise<void> {
    await this.matchRepository.delete(id);
  }
}
