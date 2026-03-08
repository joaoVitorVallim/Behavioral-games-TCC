import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match, MatchStatus, Move } from './match.entity';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
  ) {}

  async create(
    sessionId: string,
    player1Id: string,
    player2Id: string,
  ): Promise<Match> {
    const match = this.matchRepository.create({
      session_id: sessionId,
      player1_id: player1Id,
      player2_id: player2Id,
      moves: [],
      status: MatchStatus.WAITING,
    });

    return await this.matchRepository.save(match);
  }

  async findAll(filters?: { sessionId?: string; status?: MatchStatus }): Promise<Match[]> {
    const query = this.matchRepository.createQueryBuilder('match');

    if (filters?.sessionId) {
      query.andWhere('match.session_id = :sessionId', { sessionId: filters.sessionId });
    }

    if (filters?.status) {
      query.andWhere('match.status = :status', { status: filters.status });
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

  async addMove(matchId: string, move: Move): Promise<Match> {
    const match = await this.matchRepository.findOne({ where: { id: matchId } });
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    if (!match.moves) {
      match.moves = [];
    }

    match.moves.push(move);
    return await this.matchRepository.save(match);
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
