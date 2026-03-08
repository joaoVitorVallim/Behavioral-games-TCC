import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from './settings.entity';
import { SettingsGameCards } from './settings-game-cards.entity';
import { SettingsGameWords } from './settings-game-words.entity';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { GameService } from '../game/game.service';
import { GameType } from '../game/games.enum';
import { isValidPlayerField, PLAYER_OPTIONAL_FIELDS } from '../common/constants/player-fields.constants';

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

  /**
   * Valida e filtra os inputInfos para garantir que apenas campos opcionais válidos sejam incluídos
   * @param inputInfos - Array de campos a validar
   * @returns Array filtrado com apenas campos válidos
   * @throws BadRequestException se houver campos inválidos
   */
  private validateAndFilterInputInfos(inputInfos?: string[]): string[] {
    if (!inputInfos || inputInfos.length === 0) {
      return [];
    }

    const invalidFields = inputInfos.filter(field => !isValidPlayerField(field));

    if (invalidFields.length > 0) {
      throw new BadRequestException(
        `Campos inválidos em inputInfos: [${invalidFields.join(', ')}]. Campos válidos são: [${PLAYER_OPTIONAL_FIELDS.join(', ')}]`,
      );
    }

    // Remove duplicatas
    return Array.from(new Set(inputInfos));
  }

  /**
   * Retorna a lista de campos opcionais válidos do Player
   */
  getValidPlayerFields(): string[] {
    return [...PLAYER_OPTIONAL_FIELDS];
  }

  async create(dto: CreateSettingsDto, gameType?: 'cards' | 'words'): Promise<Settings> {
    // Verify game type is valid
    if (!this.gameService.isValidGameType(dto.jogo)) {
      throw new BadRequestException(`Invalid game type: ${dto.jogo}`);
    }

    // Validate and filter inputInfos
    const validatedInputInfos = this.validateAndFilterInputInfos(dto.inputInfos);

    // If gameType not provided, infer from dto.jogo
    if (!gameType) {
      gameType = dto.jogo === GameType.CARDS ? 'cards' : 'words';
    }

    let settings: Settings;

    if (gameType === 'cards') {
      const cardsSettings = this.settingsCardsRepository.create({
        configName: dto.configName,
        jogo: dto.jogo,
        inputInfos: validatedInputInfos,
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
        jogo: dto.jogo,
        inputInfos: validatedInputInfos,
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

  async findAll(jogo?: GameType): Promise<Settings[]> {
    if (!jogo) {
      return this.settingsRepository.find({ relations: ['sessions'] });
    }

    return this.settingsRepository.find({
      where: { jogo },
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

  async findByGame(jogo: GameType): Promise<Settings[]> {
    return this.settingsRepository.find({
      where: { jogo },
      relations: ['sessions'],
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
