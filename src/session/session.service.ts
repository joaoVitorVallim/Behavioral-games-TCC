import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './session.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { GameService } from '../game/game.service';
import { GameType } from '../game/games.enum';
import { SettingsService } from '../settings/settings.service';
import { UsersService } from '../users/users.service';
import { isValidPlayerField, PLAYER_OPTIONAL_FIELDS } from '../common/constants/player-fields.constants';

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

  /**
   * Validates and filters inputInfo to ensure only valid optional fields are included
   * @param inputInfo - Array of fields to validate
   * @returns Filtered array with valid fields only
   * @throws BadRequestException if there are invalid fields
   */
  private validateAndFilterInputInfo(inputInfo?: string[]): string[] {
    if (!inputInfo || inputInfo.length === 0) {
      return [];
    }

    const invalidFields = inputInfo.filter((field) => !isValidPlayerField(field));

    if (invalidFields.length > 0) {
      throw new BadRequestException(
        `Invalid fields in inputInfo: [${invalidFields.join(', ')}]. Valid fields are: [${PLAYER_OPTIONAL_FIELDS.join(', ')}]`,
      );
    }

    // Remove duplicates
    return Array.from(new Set(inputInfo));
  }

  async create(dto: CreateSessionDto): Promise<Session> {
    // Verify game type is valid
    if (!this.gameService.isValidGameType(dto.game)) {
      throw new BadRequestException(`Invalid game type: ${dto.game}`);
    }

    // Verify user exists
    const user = await this.usersService.findOne(dto.user_id);
    if (!user) {
      throw new NotFoundException(`User with ID ${dto.user_id} not found`);
    }

    // Validate and normalize inputInfo for the session
    const validatedInputInfo = this.validateAndFilterInputInfo(dto.inputInfo);

    // Create settings based on the game type
    let settings;
    try {
      // Infer game type from enum value
      const gameType = dto.game === GameType.CARDS ? 'cards' : 'words';
      settings = await this.settingsService.create(
        {
          configName: dto.settings.configName,
          game: dto.game,
          userViewPoints: dto.settings.userViewPoints,
          limitRounds: dto.settings.limitRounds,
          // Game-specific fields
          cardDeckSize: dto.settings.cardDeckSize,
          allowSpecialCards: dto.settings.allowSpecialCards,
          cardTheme: dto.settings.cardTheme,
          wordPoolSize: dto.settings.wordPoolSize,
          difficulty: dto.settings.difficulty,
          includeTimerPerWord: dto.settings.includeTimerPerWord,
          secondsPerWord: dto.settings.secondsPerWord,
        },
        gameType,
      );
    } catch (error) {
      throw new BadRequestException(`Failed to create settings: ${error.message}`);
    }

    let sessionSettings;
    try {
      sessionSettings = await this.settingsService.createCopy(
        settings.id,
        `${dto.settings.configName} (Session)`,
      );
    } catch (error) {
      throw new BadRequestException(`Failed to create settings snapshot: ${error.message}`);
    }

    // Generate unique invite code
    let inviteCode = this.generateInviteCode();
    let codeExists = await this.sessionRepository.findOne({
      where: { inviteCode: inviteCode },
    });

    while (codeExists) {
      inviteCode = this.generateInviteCode();
      codeExists = await this.sessionRepository.findOne({
        where: { inviteCode: inviteCode },
      });
    }

    const session = this.sessionRepository.create({
      game: dto.game as GameType,
      settings_id: sessionSettings.id,
      inviteCode: inviteCode,
      user_id: dto.user_id,
      inputInfo: validatedInputInfo,
      isActive: true,
    });

    return await this.sessionRepository.save(session);
  }

  async findAll(filters?: { game?: GameType; userId?: string; isActive?: boolean }): Promise<Session[]> {
    const where: any = {};

    if (filters?.game) {
      where.game = filters.game;
    }

    if (filters?.userId) {
      where.user_id = filters.userId;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const findOptions: any = {
      relations: ['settings', 'user', 'players'],
      order: { created_at: 'DESC' },
    };

    // Only add where clause if there are filters
    if (Object.keys(where).length > 0) {
      findOptions.where = where;
    }

    return await this.sessionRepository.find(findOptions);
  }

  async findOne(id: string): Promise<Session> {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: ['settings', 'user', 'players'],
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    return session;
  }

  async findByInviteCode(code: string): Promise<Session> {
    const session = await this.sessionRepository.findOne({
      where: { inviteCode: code },
      relations: ['settings', 'user', 'players'],
    });

    if (!session) {
      throw new NotFoundException(`Session with invite code ${code} not found`);
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
    await this.sessionRepository.delete(id);
  }

  async getSessionStats(id: string) {
    const session = await this.findOne(id);
    const gameInfo = this.gameService.findOne(session.game);

    return {
      sessionId: session.id,
      game: session.game,
      gameName: gameInfo?.name,
      inviteCode: session.inviteCode,
      totalPlayers: session.players.length,
      isActive: session.isActive,
      createdAt: session.created_at,
      finishedAt: session.finished_at,
      settings: session.settings,
      redirectUrl: this.gameService.getRedirectUrl(session.game, session.inviteCode),
    };
  }
}
