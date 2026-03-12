import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { GameType } from '../game/games.enum';

@ApiTags('Settings')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create new game configuration',
    description: 'Creates a new configuration preset for a game type (Cards or Words)',
  })
  @ApiResponse({
    status: 201,
    description: 'Configuration created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - invalid data',
  })
  create(@Body() createSettingsDto: CreateSettingsDto) {
    return this.settingsService.create(createSettingsDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all configurations',
    description: 'Returns list of all configurations, optionally filtered by game type',
  })
  @ApiQuery({
    name: 'game',
    required: false,
    enum: ['cards', 'words'],
    description: 'Filter by game type',
  })
  @ApiResponse({
    status: 200,
    description: 'Configurations list returned successfully',
  })
  findAll(@Query('game') game?: GameType) {
    return this.settingsService.findAll(game);
  }

  @Get('game/:game')
  @ApiOperation({
    summary: 'List configurations by game type',
    description: 'Returns all configurations for a specific game type',
  })
  @ApiParam({
    name: 'game',
    enum: ['cards', 'words'],
    description: 'Game type',
  })
  @ApiResponse({
    status: 200,
    description: 'Configurations returned successfully',
  })
  findByGame(@Param('game') game: GameType) {
    return this.settingsService.findByGame(game);
  }

  @Get('player-fields/valid')
  @ApiOperation({
    summary: 'List valid optional Player fields',
    description: 'Returns the list of optional fields that can be added to the configuration inputInfo',
  })
  @ApiResponse({
    status: 200,
    description: 'Valid fields list returned successfully',
    schema: {
      example: ['nickname', 'course', 'age', 'gender', 'profession'],
    },
  })
  getValidPlayerFields() {
    return this.settingsService.getValidPlayerFields();
  }

  @Get('game-config/fields')
  @ApiOperation({
    summary: 'Get game config field structure',
    description: 'Returns field names and types for Cards and Words configurations',
  })
  @ApiQuery({
    name: 'game',
    required: false,
    enum: ['cards', 'words'],
    description: 'Filter by game type',
  })
  @ApiResponse({
    status: 200,
    description: 'Field structure returned successfully',
    schema: {
      example: {
        common: [
          { name: 'configName', type: 'string' },
          { name: 'game', type: 'enum(GameType)' },
          { name: 'inputInfo', type: 'string[]' },
          { name: 'userViewPoints', type: 'boolean' },
          { name: 'limitRounds', type: 'number' },
        ],
        cards: [
          { name: 'cardDeckSize', type: 'number' },
          { name: 'allowSpecialCards', type: 'boolean' },
          { name: 'cardTheme', type: 'string' },
        ],
        words: [
          { name: 'wordPoolSize', type: 'number' },
          { name: 'difficulty', type: 'string' },
          { name: 'includeTimerPerWord', type: 'boolean' },
          { name: 'secondsPerWord', type: 'number' },
        ],
      },
    },
  })
  getGameConfigFields(@Query('game') game?: 'cards' | 'words') {
    return this.settingsService.getGameConfigFields(game);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get configuration details',
    description: 'Returns complete information of a specific configuration',
  })
  @ApiParam({
    name: 'id',
    description: 'Configuration ID',
    example: 'c7fb8887-9739-4aab-8934-df34707d8d98',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuration found',
  })
  @ApiResponse({
    status: 404,
    description: 'Configuration not found',
  })
  findOne(@Param('id') id: string) {
    return this.settingsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update configuration',
    description: 'Updates parameters of an existing configuration',
  })
  @ApiParam({
    name: 'id',
    description: 'Configuration ID',
    example: 'c7fb8887-9739-4aab-8934-df34707d8d98',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuration updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Configuration not found',
  })
  update(
    @Param('id') id: string,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ) {
    return this.settingsService.update(id, updateSettingsDto);
  }

  @Post(':id/copy')
  @ApiOperation({
    summary: 'Duplicate configuration',
    description: 'Creates a copy of an existing configuration with a new name',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the configuration to be copied',
    example: 'c7fb8887-9739-4aab-8934-df34707d8d98',
  })
  @ApiResponse({
    status: 201,
    description: 'Configuration copied successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Configuration not found',
  })
  createCopy(
    @Param('id') id: string,
    @Body('configName') configName?: string,
  ) {
    return this.settingsService.createCopy(id, configName);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete configuration',
    description: 'Removes a configuration from the system',
  })
  @ApiParam({
    name: 'id',
    description: 'Configuration ID',
    example: 'c7fb8887-9739-4aab-8934-df34707d8d98',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuration deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Configuration not found',
  })
  remove(@Param('id') id: string) {
    return this.settingsService.remove(id);
  }
}
