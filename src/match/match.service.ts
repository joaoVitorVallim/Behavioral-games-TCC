import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match, MatchStatus, Jogada } from './match.entity';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
  ) {}

  async create(
    sessaoId: string,
    player1Id: string,
    player2Id: string,
  ): Promise<Match> {
    const match = this.matchRepository.create({
      sessao_id: sessaoId,
      player1_id: player1Id,
      player2_id: player2Id,
      jogadas: [],
      status: MatchStatus.AGUARDANDO,
    });

    return await this.matchRepository.save(match);
  }

  async findAll(filters?: { sessaoId?: string; status?: MatchStatus }): Promise<Match[]> {
    const query = this.matchRepository.createQueryBuilder('match');

    if (filters?.sessaoId) {
      query.andWhere('match.sessao_id = :sessaoId', { sessaoId: filters.sessaoId });
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

  async addJogada(matchId: string, jogada: Jogada): Promise<Match> {
    const match = await this.matchRepository.findOne({ where: { id: matchId } });
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    if (!match.jogadas) {
      match.jogadas = [];
    }

    match.jogadas.push(jogada);
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
