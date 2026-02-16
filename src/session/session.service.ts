import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './session.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { JoinSessionDto } from './dto/join-session.dto';
import { MatchStatus } from '../match/match.entity';
import { PlayerService } from '../player/player.service';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    private playerService: PlayerService,
  ) {}

  async create(createSessionDto: CreateSessionDto): Promise<Session> {
    const session = this.sessionRepository.create(createSessionDto);
    return await this.sessionRepository.save(session);
  }

  async findAll(): Promise<Session[]> {
    return await this.sessionRepository.find({
      relations: ['game', 'settings', 'user'],
    });
  }

  async findOne(id: string): Promise<Session | null> {
    return await this.sessionRepository.findOne({
      where: { id },
      relations: ['game', 'settings', 'user', 'matches'],
    });
  }

  async findByCode(inviteCode: string): Promise<Session | null> {
    return await this.sessionRepository.findOne({
      where: { inviteCode },
      relations: ['game', 'settings'],
    });
  }

  async joinSession(inviteCode: string, joinSessionDto: JoinSessionDto) {
    const session = await this.sessionRepository.findOne({
      where: { inviteCode },
      relations: ['game', 'settings'],
    });

    if (!session) {
      throw new NotFoundException(`Sessão com código ${inviteCode} não encontrada`);
    }

    // Cria o player já associado à sessão
    const player = await this.playerService.create({
      ...joinSessionDto,
      session_id: session.id,
    });

    return {
      message: 'Player entrou na sessão com sucesso',
      session: {
        id: session.id,
        inviteCode: session.inviteCode,
        roundsLimit: session.roundsLimit,
        game: session.game,
        settings: session.settings,
      },
      player: {
        id: player.id,
        nickname: player.nickname,
        course: player.course,
        age: player.age,
        gender: player.gender,
        profession: player.profession,
      },
    };
  }

  async update(id: string, updateSessionDto: UpdateSessionDto): Promise<Session | null> {
    await this.sessionRepository.update(id, updateSessionDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.sessionRepository.delete(id);
  }

  async getResults(id: string) {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: ['game', 'settings', 'matches', 'matches.player1', 'matches.player2'],
    });

    if (!session) {
      throw new NotFoundException(`Sessão ${id} não encontrada`);
    }

    const matches = session.matches || [];

    const summary = {
      totalMatches: matches.length,
      byStatus: {
        waiting: matches.filter(m => m.status === MatchStatus.WAITING).length,
        in_progress: matches.filter(m => m.status === MatchStatus.IN_PROGRESS).length,
        finished: matches.filter(m => m.status === MatchStatus.FINISHED).length,
        cancelled: matches.filter(m => m.status === MatchStatus.CANCELLED).length,
      },
    };

    const playersMap = new Map<string, any>();
    for (const match of matches) {
      if (match.player1) playersMap.set(match.player1.id, match.player1);
      if (match.player2) playersMap.set(match.player2.id, match.player2);
    }

    return {
      session: {
        id: session.id,
        inviteCode: session.inviteCode,
        roundsLimit: session.roundsLimit,
        game: session.game,
        settings: session.settings,
        createdAt: session.createdAt,
      },
      summary,
      players: Array.from(playersMap.values()),
      matches: matches.map(m => ({
        id: m.id,
        player1: m.player1,
        player2: m.player2,
        moves: m.moves,
        status: m.status,
        matchTime: m.matchTime,
        createdAt: m.createdAt,
      })),
    };
  }


  async exportData(id: string) {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: ['game', 'matches', 'matches.player1', 'matches.player2'],
    });

    if (!session) {
      throw new NotFoundException(`Sessão ${id} não encontrada`);
    }

    const matches = session.matches || [];

    const headers = ['match_id', 'player1_nickname', 'player1_course', 'player2_nickname', 'player2_course', 'round', 'p1_move', 'p2_move', 'status', 'createdAt'];
    const rows: string[][] = [];

    for (const m of matches) {
      const moves = m.moves || {};
      const roundKeys = Object.keys(moves);

      if (roundKeys.length === 0) {
        rows.push([
          m.id,
          m.player1?.nickname || '',
          m.player1?.course || '',
          m.player2?.nickname || '',
          m.player2?.course || '',
          '',
          '',
          '',
          m.status,
          m.createdAt?.toISOString() || '',
        ]);
      } else {
        for (const round of roundKeys) {
          const roundData = moves[round] || {};
          rows.push([
            m.id,
            m.player1?.nickname || '',
            m.player1?.course || '',
            m.player2?.nickname || '',
            m.player2?.course || '',
            round,
            roundData.p1 || '',
            roundData.p2 || '',
            m.status,
            m.createdAt?.toISOString() || '',
          ]);
        }
      }
    }

    const csv = [
      headers.join(','),
      ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return {
      csv,
      filename: `session_${session.inviteCode}.csv`,
    };
  }
}
