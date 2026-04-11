import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Session } from './session.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { GameService } from '../game/game.service';
import { GameType } from '../game/games.enum';
import { SettingsService } from '../settings/settings.service';
import { Settings } from '../settings/settings.entity';
import { UsersService } from '../users/users.service';
import { isValidPlayerField, PLAYER_OPTIONAL_FIELDS } from '../common/constants/player-fields.constants';
import { Player } from '../player/player.entity';
import { Match, MatchStatus } from '../match/match.entity';
import { JoinSessionDto } from './dto/join-session.dto';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    private dataSource: DataSource,
    private gameService: GameService,
    private settingsService: SettingsService,
    private usersService: UsersService,
  ) {}

  private getMaxPlayersForGame(game: GameType): number {
    const twoPlayerGames: GameType[] = [GameType.PRISONER];
    return twoPlayerGames.includes(game) ? 2 : 1;
  }

  private validateRequiredPlayerFields(
    requiredFields: string[] | undefined,
    playerData: JoinSessionDto,
  ): void {
    if (!requiredFields || requiredFields.length === 0) {
      return;
    }

    for (const field of requiredFields) {
      const value = playerData[field as keyof JoinSessionDto];
      const isMissingString =
        typeof value === 'string' && value.trim().length === 0;

      if (value === undefined || value === null || isMissingString) {
        throw new BadRequestException(
          `Field ${field} is required by this session inputInfo`,
        );
      }
    }
  }

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
    const gameTypeMap: Record<GameType, 'roulette' | 'prisoner'> = {
      [GameType.ROULETTE]: 'roulette',
      [GameType.PRISONER]: 'prisoner',
    };

    let settings: Settings;
    try {
      settings = await this.settingsService.create(
        {
          configName: dto.settings.configName,
          game: dto.game,
          userViewPoints: dto.settings.userViewPoints,
          limitRounds: dto.settings.limitRounds,
          timeLimit: dto.settings.timeLimit,
          pointsLimit: dto.settings.pointsLimit,
          popup: dto.settings.popup,
          initMoney: dto.settings.initMoney,
        },
        gameTypeMap[dto.game],
      );
    } catch (error: unknown) {
      throw new BadRequestException(`Failed to create settings: ${(error as Error).message}`);
    }

    let sessionSettings: Settings;
    try {
      sessionSettings = await this.settingsService.createCopy(
        settings.id,
        `${dto.settings.configName} (Session)`,
      );
    } catch (error: unknown) {
      throw new BadRequestException(`Failed to create settings snapshot: ${(error as Error).message}`);
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

  async joinByInviteCode(payload: JoinSessionDto) {
    const inviteCode = payload.inviteCode.trim().toUpperCase();

    return await this.dataSource.transaction(async (manager) => {
      const lockedSession = await manager
        .getRepository(Session)
        .createQueryBuilder('session')
        .where('session.inviteCode = :inviteCode', { inviteCode })
        .setLock('pessimistic_write')
        .getOne();

      if (!lockedSession) {
        throw new NotFoundException(
          `Session with invite code ${inviteCode} not found`,
        );
      }

      const session = await manager.getRepository(Session).findOne({
        where: { id: lockedSession.id },
        relations: ['settings', 'user'],
      });

      if (!session) {
        throw new NotFoundException(`Session with invite code ${inviteCode} not found`);
      }

      if (!session.isActive) {
        throw new BadRequestException('Session is not active');
      }

      this.validateRequiredPlayerFields(session.inputInfo, payload);

      const playerRepo = manager.getRepository(Player);
      const matchRepo = manager.getRepository(Match);

      const maxPlayers = this.getMaxPlayersForGame(session.game);
      const currentPlayersCount = await playerRepo.count({
        where: { session_id: session.id },
      });

      if (currentPlayersCount >= maxPlayers) {
        throw new BadRequestException(
          `Session is full for ${session.game} mode`,
        );
      }

      const player = playerRepo.create({
        session_id: session.id,
        educationLevel: payload.educationLevel,
        semester: payload.semester,
        course: payload.course,
        age: payload.age,
        gender: payload.gender,
        profession: payload.profession,
      });

      const savedPlayer = await playerRepo.save(player);
      const playersCount = currentPlayersCount + 1;

      const targetPlayers = maxPlayers;
      let createdMatch: Match | null = null;

      if (playersCount === targetPlayers) {
        const existingMatch = await matchRepo.findOne({
          where: { session_id: session.id },
        });

        if (!existingMatch) {
          if (session.game === GameType.PRISONER) {
            const players = await playerRepo.find({
              where: { session_id: session.id },
              order: { created_at: 'ASC' },
              take: 2,
            });

            if (players.length < 2) {
              throw new BadRequestException(
                'Not enough players to create prisoner match',
              );
            }

            createdMatch = matchRepo.create({
              session_id: session.id,
              player1_id: players[0].id,
              player2_id: players[1].id,
              status: MatchStatus.AGUARDANDO,
              moves: {},
            });
          } else {
            createdMatch = matchRepo.create({
              session_id: session.id,
              player1_id: savedPlayer.id,
              player2_id: null,
              status: MatchStatus.AGUARDANDO,
              moves: {},
            });
          }

          createdMatch = await matchRepo.save(createdMatch);
        }
      }

      const updatedSession = await manager.getRepository(Session).findOne({
        where: { id: session.id },
        relations: ['settings', 'user', 'players'],
      });

      return {
        session: updatedSession,
        player: savedPlayer,
        playersCount,
        maxPlayers,
        match: createdMatch,
      };
    });
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
