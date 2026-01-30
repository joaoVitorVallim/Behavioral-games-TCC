import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from './settings.entity';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private settingsRepository: Repository<Settings>,
  ) {}

  async create(createSettingsDto: CreateSettingsDto): Promise<Settings> {
    const settings = this.settingsRepository.create(createSettingsDto);
    return await this.settingsRepository.save(settings);
  }

  async findAll(): Promise<Settings[]> {
    return await this.settingsRepository.find();
  }

  async findOne(id: string): Promise<Settings | null> {
    return await this.settingsRepository.findOne({ where: { id } });
  }

  async update(id: string, updateSettingsDto: UpdateSettingsDto): Promise<Settings | null> {
    await this.settingsRepository.update(id, updateSettingsDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.settingsRepository.delete(id);
  }
}
