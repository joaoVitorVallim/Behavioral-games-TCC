import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from './settings.entity';
import { SettingsGameCards } from './settings-game-cards.entity';
import { SettingsGameRoulette } from './settings-game-roulette.entity';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { GameService } from '../game/game.service';
import { GameType } from '../game/games.enum';
import { PLAYER_OPTIONAL_FIELDS } from '../common/constants/player-fields.constants';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private settingsRepository: Repository<Settings>,
    @InjectRepository(SettingsGameCards)
    private settingsCardsRepository: Repository<SettingsGameCards>,
    @InjectRepository(SettingsGameRoulette)
    private settingsRouletteRepository: Repository<SettingsGameRoulette>,
    private gameService: GameService,
  ) {}

  /**
   * Returns the list of valid optional Player fields
   */
  getValidPlayerFields(): string[] {
    return [...PLAYER_OPTIONAL_FIELDS];
  }

  /**
   * Returns the field structure for each game configuration.
   * Used by the frontend to know which fields and types to request from users.
   */
  getGameConfigFields(game?: 'cards' | 'roulette') {
    const common = [
      { name: 'configName', type: 'string' },
      { name: 'game', type: 'enum(GameType)' },
    ];

    const cards = [
      { name: 'userViewPoints', type: 'boolean' },
      { name: 'limitRounds', type: 'number' },
    ];

    const roulette = [
      { name: 'timeLimit', type: 'number' },
      { name: 'pointsLimit', type: 'number' },
      { name: 'popup', type: 'json|null' },
      { name: 'initMoney', type: 'number' },
    ];

    if (game === 'cards') {
      return { common, cards };
    }

    if (game === 'roulette') {
      return { common, roulette };
    }

    return { common, cards, roulette };
  }

  async create(dto: CreateSettingsDto, gameType?: 'cards' | 'roulette'): Promise<Settings> {
    // Verify game type is valid
    if (!this.gameService.isValidGameType(dto.game)) {
      throw new BadRequestException(`Invalid game type: ${dto.game}`);
    }

    // If gameType not provided, infer from dto.game
    if (!gameType) {
      gameType = dto.game === GameType.CARDS ? 'cards' : 'roulette';
    }

    let settings: Settings;

    if (gameType === 'cards') {
      const cardsSettings = this.settingsCardsRepository.create({
        configName: dto.configName,
        game: dto.game,
        userViewPoints: dto.userViewPoints ?? false,
        limitRounds: dto.limitRounds ?? 10,
      });
      settings = await this.settingsCardsRepository.save(cardsSettings);
    } else if (gameType === 'roulette') {
      const rouletteSettings = this.settingsRouletteRepository.create({
        configName: dto.configName,
        game: dto.game,
        timeLimit: dto.timeLimit,
        pointsLimit: dto.pointsLimit,
        popup: dto.popup,
        initMoney: dto.initMoney,
      });
      settings = await this.settingsRouletteRepository.save(rouletteSettings);
    } else {
      throw new BadRequestException(`Invalid game type: ${gameType}`);
    }

    return settings;
  }

  async findAll(game?: GameType): Promise<Settings[]> {
    if (!game) {
      return this.settingsRepository.find({ relations: ['sessions'] });
    }

    return this.settingsRepository.find({
      where: { game },
      relations: ['sessions'],
    });
  }

  async findOne(id: string): Promise<Settings> {
    const settings = await this.settingsRepository.findOne({
      where: { id },
      relations: ['sessions'],
    });

    if (!settings) {
      throw new NotFoundException(`Settings with ID ${id} not found`);
    }

    return settings;
  }

  async findByGame(game: GameType): Promise<Settings[]> {
    return this.settingsRepository.find({
      where: { game },
      relations: ['sessions'],
    });
  }

  async update(id: string, dto: UpdateSettingsDto): Promise<Settings> {
    const settings = await this.findOne(id);

    // Update common fields
    if (dto.configName) settings.configName = dto.configName;

    // Update type-specific fields
    if (settings instanceof SettingsGameCards) {
      if (dto.userViewPoints !== undefined) settings.userViewPoints = dto.userViewPoints;
      if (dto.limitRounds !== undefined) settings.limitRounds = dto.limitRounds;
      return await this.settingsCardsRepository.save(settings);
    } else if (settings instanceof SettingsGameRoulette) {
      if (dto.timeLimit !== undefined) settings.timeLimit = dto.timeLimit;
      if (dto.pointsLimit !== undefined) settings.pointsLimit = dto.pointsLimit;
      if (dto.popup !== undefined) settings.popup = dto.popup;
      if (dto.initMoney !== undefined) settings.initMoney = dto.initMoney;
      return await this.settingsRouletteRepository.save(settings);
    }

    return await this.settingsRepository.save(settings);
  }

  async remove(id: string): Promise<void> {
    const settings = await this.findOne(id);

    // Prevent deletion if settings has active sessions
    if (settings.sessions && settings.sessions.length > 0) {
      throw new BadRequestException('Cannot delete settings that have active sessions');
    }

    if (settings instanceof SettingsGameCards) {
      await this.settingsCardsRepository.delete(id);
    } else if (settings instanceof SettingsGameRoulette) {
      await this.settingsRouletteRepository.delete(id);
    } else {
      await this.settingsRepository.delete(id);
    }
  }

  /**
   * Creates a copy of settings for session immutability
   */
  async createCopy(id: string, newConfigName?: string): Promise<Settings> {
    const original = await this.findOne(id);

    const copy = {
      ...original,
      id: undefined,
      configName: newConfigName || `${original.configName} (copy)`,
      createdAt: undefined,
    };

    if (original instanceof SettingsGameCards) {
      return await this.settingsCardsRepository.save(copy);
    } else if (original instanceof SettingsGameRoulette) {
      return await this.settingsRouletteRepository.save(copy);
    }

    return await this.settingsRepository.save(copy);
  }
}
