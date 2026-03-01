import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './session.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { GameService } from '../game/game.service';
import { SettingsService } from '../settings/settings.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    private gameService: GameService,
    private settingsService: SettingsService,
    private usersService: UsersService,
  ) {}

  /**
   * Generate a unique invite code
   */
  private generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async create(dto: CreateSessionDto): Promise<Session> {
    // Verify game exists
    const game = await this.gameService.findOne(dto.jogo_id);
    if (!game) {
      throw new NotFoundException(`Game with ID ${dto.jogo_id} not found`);
    }

    // Verify settings exists
    const settings = await this.settingsService.findOne(dto.settings_id);
    if (!settings) {
      throw new NotFoundException(`Settings with ID ${dto.settings_id} not found`);
    }

    // Verify user exists
    const user = await this.usersService.findOne(dto.user_id);
    if (!user) {
      throw new NotFoundException(`User with ID ${dto.user_id} not found`);
    }

    // Generate unique invite code
    let inviteCode = this.generateInviteCode();
    let codeExists = await this.sessionRepository.findOne({
      where: { codigo_convite: inviteCode },
    });

    while (codeExists) {
      inviteCode = this.generateInviteCode();
      codeExists = await this.sessionRepository.findOne({
        where: { codigo_convite: inviteCode },
      });
    }

    const session = this.sessionRepository.create({
      jogo_id: dto.jogo_id,
      settings_id: dto.settings_id,
      codigo_convite: inviteCode,
      user_id: dto.user_id,
      isActive: true,
    });

    return await this.sessionRepository.save(session);
  }

  async findAll(filters?: { gameId?: string; userId?: string; isActive?: boolean }): Promise<Session[]> {
    const query = this.sessionRepository.createQueryBuilder('session');

    if (filters?.gameId) {
      query.andWhere('session.jogo_id = :gameId', { gameId: filters.gameId });
    }

    if (filters?.userId) {
      query.andWhere('session.user_id = :userId', { userId: filters.userId });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('session.isActive = :isActive', { isActive: filters.isActive });
    }

    return await query.leftJoinAndSelect('session.game', 'game')
      .leftJoinAndSelect('session.settings', 'settings')
      .leftJoinAndSelect('session.user', 'user')
      .leftJoinAndSelect('session.players', 'players')
      .orderBy('session.created_at', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<Session> {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: ['game', 'settings', 'user', 'players'],
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    return session;
  }

  async findByInviteCode(codigo: string): Promise<Session> {
    const session = await this.sessionRepository.findOne({
      where: { codigo_convite: codigo },
      relations: ['game', 'settings', 'user', 'players'],
    });

    if (!session) {
      throw new NotFoundException(`Session with invite code ${codigo} not found`);
    }

    return session;
  }

  async update(id: string, dto: UpdateSessionDto): Promise<Session> {
    const session = await this.findOne(id);

    if (dto.isActive !== undefined) {
      session.isActive = dto.isActive;

      // If marking as inactive, set finish time
      if (!dto.isActive && !session.finished_at) {
        session.finished_at = new Date();
      }
    }

    return await this.sessionRepository.save(session);
  }

  async finish(id: string): Promise<Session> {
    const session = await this.findOne(id);
    session.isActive = false;
    session.finished_at = new Date();
    return await this.sessionRepository.save(session);
  }

  async remove(id: string): Promise<void> {
    const session = await this.findOne(id);
    await this.sessionRepository.delete(id);
  }

  async getSessionStats(id: string) {
    const session = await this.findOne(id);

    return {
      sessionId: session.id,
      gameId: session.jogo_id,
      gameName: session.game.name,
      inviteCode: session.codigo_convite,
      totalPlayers: session.players.length,
      isActive: session.isActive,
      createdAt: session.created_at,
      finishedAt: session.finished_at,
      settings: session.settings,
    };
  }
}
