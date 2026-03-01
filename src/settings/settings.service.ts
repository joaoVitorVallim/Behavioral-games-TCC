import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from './settings.entity';
import { SettingsGameCards } from './settings-game-cards.entity';
import { SettingsGameWords } from './settings-game-words.entity';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { GameService } from '../game/game.service';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private settingsRepository: Repository<Settings>,
    @InjectRepository(SettingsGameCards)
    private settingsCardsRepository: Repository<SettingsGameCards>,
    @InjectRepository(SettingsGameWords)
    private settingsWordsRepository: Repository<SettingsGameWords>,
    private gameService: GameService,
  ) {}

  async create(dto: CreateSettingsDto, gameType: 'cards' | 'words'): Promise<Settings> {
    // Verify game exists
    const game = await this.gameService.findOne(dto.game_id);
    if (!game) {
      throw new NotFoundException(`Game with ID ${dto.game_id} not found`);
    }

    let settings: Settings;

    if (gameType === 'cards') {
      const cardsSettings = this.settingsCardsRepository.create({
        configName: dto.configName,
        game_id: dto.game_id,
        inputInfos: dto.inputInfos || [],
        userViewPoints: dto.userViewPoints ?? false,
        limitRounds: dto.limitRounds ?? 10,
        cardDeckSize: dto.cardDeckSize,
        allowSpecialCards: dto.allowSpecialCards,
        cardTheme: dto.cardTheme,
      });
      settings = await this.settingsCardsRepository.save(cardsSettings);
    } else if (gameType === 'words') {
      const wordsSettings = this.settingsWordsRepository.create({
        configName: dto.configName,
        game_id: dto.game_id,
        inputInfos: dto.inputInfos || [],
        userViewPoints: dto.userViewPoints ?? false,
        limitRounds: dto.limitRounds ?? 10,
        wordPoolSize: dto.wordPoolSize,
        difficulty: dto.difficulty,
        includeTimerPerWord: dto.includeTimerPerWord,
        secondsPerWord: dto.secondsPerWord,
      });
      settings = await this.settingsWordsRepository.save(wordsSettings);
    } else {
      throw new BadRequestException(`Invalid game type: ${gameType}`);
    }

    return settings;
  }

  async findAll(gameType?: 'cards' | 'words'): Promise<Settings[]> {
    if (!gameType) {
      return this.settingsRepository.find({ relations: ['game', 'sessions'] });
    }

    if (gameType === 'cards') {
      return this.settingsCardsRepository.find({ relations: ['game', 'sessions'] });
    } else if (gameType === 'words') {
      return this.settingsWordsRepository.find({ relations: ['game', 'sessions'] });
    }

    return [];
  }

  async findOne(id: string): Promise<Settings> {
    const settings = await this.settingsRepository.findOne({
      where: { id },
      relations: ['game', 'sessions'],
    });

    if (!settings) {
      throw new NotFoundException(`Settings with ID ${id} not found`);
    }

    return settings;
  }

  async findByGame(gameId: string): Promise<Settings[]> {
    return this.settingsRepository.find({
      where: { game_id: gameId },
      relations: ['game', 'sessions'],
    });
  }

  async update(id: string, dto: UpdateSettingsDto): Promise<Settings> {
    const settings = await this.findOne(id);

    // Update common fields
    if (dto.configName) settings.configName = dto.configName;
    if (dto.inputInfos) settings.inputInfos = dto.inputInfos;
    if (dto.userViewPoints !== undefined) settings.userViewPoints = dto.userViewPoints;
    if (dto.limitRounds !== undefined) settings.limitRounds = dto.limitRounds;

    // Update type-specific fields
    if (settings instanceof SettingsGameCards) {
      if (dto.cardDeckSize !== undefined) settings.cardDeckSize = dto.cardDeckSize;
      if (dto.allowSpecialCards !== undefined) settings.allowSpecialCards = dto.allowSpecialCards;
      if (dto.cardTheme) settings.cardTheme = dto.cardTheme;
      return await this.settingsCardsRepository.save(settings);
    } else if (settings instanceof SettingsGameWords) {
      if (dto.wordPoolSize !== undefined) settings.wordPoolSize = dto.wordPoolSize;
      if (dto.difficulty) settings.difficulty = dto.difficulty;
      if (dto.includeTimerPerWord !== undefined) settings.includeTimerPerWord = dto.includeTimerPerWord;
      if (dto.secondsPerWord !== undefined) settings.secondsPerWord = dto.secondsPerWord;
      return await this.settingsWordsRepository.save(settings);
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
    } else if (settings instanceof SettingsGameWords) {
      await this.settingsWordsRepository.delete(id);
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
    } else if (original instanceof SettingsGameWords) {
      return await this.settingsWordsRepository.save(copy);
    }

    return await this.settingsRepository.save(copy);
  }
}
