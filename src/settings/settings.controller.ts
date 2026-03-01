import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post(':gameType')
  create(
    @Param('gameType') gameType: 'cards' | 'words',
    @Body() createSettingsDto: CreateSettingsDto,
  ) {
    return this.settingsService.create(createSettingsDto, gameType);
  }

  @Get()
  findAll(@Query('gameType') gameType?: 'cards' | 'words') {
    return this.settingsService.findAll(gameType);
  }

  @Get('game/:gameId')
  findByGame(@Param('gameId') gameId: string) {
    return this.settingsService.findByGame(gameId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.settingsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ) {
    return this.settingsService.update(id, updateSettingsDto);
  }

  @Post(':id/copy')
  createCopy(
    @Param('id') id: string,
    @Body('configName') configName?: string,
  ) {
    return this.settingsService.createCopy(id, configName);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.settingsService.remove(id);
  }
}
