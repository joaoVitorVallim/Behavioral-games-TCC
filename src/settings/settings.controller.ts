import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
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
    description: 'Creates a new configuration preset for a game type (Cards or Roulette)',
  })
  @ApiBody({
    description: 'Cards and Roulette payload examples',
    schema: {
      oneOf: [
        {
          type: 'object',
          required: ['configName', 'game'],
          properties: {
            configName: { type: 'string', example: 'Cards Config Level 1' },
            game: { type: 'string', enum: ['cards'], example: 'cards' },
            userViewPoints: { type: 'boolean', example: true },
            limitRounds: { type: 'number', example: 10 },
          },
        },
        {
          type: 'object',
          required: ['configName', 'game'],
          properties: {
            configName: { type: 'string', example: 'Roulette Config Beginner' },
            game: { type: 'string', enum: ['roulette'], example: 'roulette' },
            timeLimit: { type: 'number', example: 60 },
            pointsLimit: { type: 'number', example: 500 },
            popup: {
              type: 'object',
              nullable: true,
              properties: {
                message: { type: 'string', example: 'Aposte agora!' },
                players: { type: 'number', example: 2 },
              },
            },
            initMoney: { type: 'number', example: 1000 },
          },
        },
      ],
    },
    examples: {
      cards: {
        summary: 'Cards configuration',
        value: {
          configName: 'Cards Config Level 1',
          game: 'cards',
          userViewPoints: true,
          limitRounds: 10,
        },
      },
      roulette: {
        summary: 'Roulette configuration',
        value: {
          configName: 'Roulette Config Beginner',
          game: 'roulette',
          timeLimit: 60,
          pointsLimit: 500,
          popup: {
            message: 'Aposte agora!',
            players: 2,
          },
          initMoney: 1000,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Configuration created successfully',
    schema: {
      examples: {
        cards: {
          summary: 'Cards configuration created',
          value: {
            id: 'c7fb8887-9739-4aab-8934-df34707d8d98',
            configName: 'Cards Config Level 1',
            game: 'cards',
            userViewPoints: true,
            limitRounds: 10,
          },
        },
        roulette: {
          summary: 'Roulette configuration created',
          value: {
            id: 'd7fb8887-9739-4aab-8934-df34707d8d98',
            configName: 'Roulette Config Beginner',
            game: 'roulette',
            timeLimit: 60,
            pointsLimit: 500,
            initMoney: 1000,
            popup: { message: 'Aposte agora!', players: 2 },
          },
        },
      },
    },
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
    enum: ['cards', 'roulette'],
    description: 'Filter by game type (optional)',
  })
  @ApiResponse({
    status: 200,
    description: 'Configurations list returned successfully',
    schema: {
      example: [
        {
          id: 'c7fb8887-9739-4aab-8934-df34707d8d98',
          configName: 'Cards Config Level 1',
          game: 'cards',
          userViewPoints: true,
          limitRounds: 10,
        },
        {
          id: 'd7fb8887-9739-4aab-8934-df34707d8d98',
          configName: 'Roulette Config Beginner',
          game: 'roulette',
          timeLimit: 60,
          pointsLimit: 500,
          initMoney: 1000,
        },
      ],
    },
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
    enum: ['cards', 'roulette'],
    description: 'Game type',
  })
  @ApiResponse({
    status: 200,
    description: 'Configurations returned successfully',
    schema: {
      examples: {
        cards: {
          summary: 'Cards configs list',
          value: [
            {
              id: 'c7fb8887-9739-4aab-8934-df34707d8d98',
              configName: 'Cards Config Level 1',
              game: 'cards',
              userViewPoints: true,
              limitRounds: 10,
            },
          ],
        },
        roulette: {
          summary: 'Roulette configs list',
          value: [
            {
              id: 'd7fb8887-9739-4aab-8934-df34707d8d98',
              configName: 'Roulette Config Beginner',
              game: 'roulette',
              timeLimit: 60,
              pointsLimit: 500,
              initMoney: 1000,
            },
          ],
        },
      },
    },
  })
  findByGame(@Param('game') game: GameType) {
    return this.settingsService.findByGame(game);
  }

  @Get('player-fields/valid')
  @ApiOperation({
    summary: 'List valid optional Player fields',
    description: 'Returns the list of optional fields that can be added to the session inputInfo',
  })
  @ApiResponse({
    status: 200,
    description: 'Valid fields list returned successfully',
    schema: {
      example: ['educationLevel', 'semester', 'course', 'age', 'gender', 'profession'],
    },
  })
  getValidPlayerFields() {
    return this.settingsService.getValidPlayerFields();
  }

  @Get('game-config/fields')
  @ApiOperation({
    summary: 'Get game config field structure',
    description: 'Returns field names and types for Cards and Roulette configurations',
  })
  @ApiQuery({
    name: 'game',
    required: false,
    enum: ['cards', 'roulette'],
    description: 'Filter by game type (optional)',
  })
  @ApiResponse({
    status: 200,
    description: 'Field structure returned successfully',
    schema: {
      example: {
        common: [
          { name: 'configName', type: 'string' },
          { name: 'game', type: 'enum(GameType)' },
        ],
        cards: [
          { name: 'userViewPoints', type: 'boolean' },
          { name: 'limitRounds', type: 'number' },
        ],
        roulette: [
          { name: 'timeLimit', type: 'number' },
          { name: 'pointsLimit', type: 'number' },
          { name: 'popup', type: 'json|null' },
          { name: 'initMoney', type: 'number' },
        ],
      },
    },
  })
  getGameConfigFields(@Query('game') game?: 'cards' | 'roulette') {
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
    schema: {
      examples: {
        cards: {
          summary: 'Cards configuration detail',
          value: {
            id: 'c7fb8887-9739-4aab-8934-df34707d8d98',
            configName: 'Cards Config Level 1',
            game: 'cards',
            userViewPoints: true,
            limitRounds: 10,
          },
        },
        roulette: {
          summary: 'Roulette configuration detail',
          value: {
            id: 'd7fb8887-9739-4aab-8934-df34707d8d98',
            configName: 'Roulette Config Beginner',
            game: 'roulette',
            timeLimit: 60,
            pointsLimit: 500,
            initMoney: 1000,
            popup: { message: 'Aposte agora!', players: 2 },
          },
        },
      },
    },
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
  @ApiBody({
    description: 'Cards and Roulette partial update examples',
    examples: {
      cards: {
        summary: 'Cards configuration update',
        value: {
          userViewPoints: false,
          limitRounds: 12,
        },
      },
      roulette: {
        summary: 'Roulette configuration update',
        value: {
          timeLimit: 45,
          pointsLimit: 600,
          initMoney: 1200,
          popup: {
            message: 'Ultimos segundos!',
            players: 1,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Configuration updated successfully',
    schema: {
      examples: {
        cards: {
          summary: 'Cards configuration updated',
          value: {
            id: 'c7fb8887-9739-4aab-8934-df34707d8d98',
            game: 'cards',
            userViewPoints: false,
            limitRounds: 12,
          },
        },
        roulette: {
          summary: 'Roulette configuration updated',
          value: {
            id: 'd7fb8887-9739-4aab-8934-df34707d8d98',
            game: 'roulette',
            timeLimit: 45,
            pointsLimit: 600,
            initMoney: 1200,
          },
        },
      },
    },
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
    schema: {
      examples: {
        cards: {
          summary: 'Cards configuration copy',
          value: {
            id: 'e7fb8887-9739-4aab-8934-df34707d8d98',
            configName: 'Cards Config Level 1 (copy)',
            game: 'cards',
          },
        },
        roulette: {
          summary: 'Roulette configuration copy',
          value: {
            id: 'f7fb8887-9739-4aab-8934-df34707d8d98',
            configName: 'Roulette Config Beginner (copy)',
            game: 'roulette',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Configuration not found',
  })
  @ApiBody({
    description: 'Optional body. If omitted, backend generates a default copy name.',
    schema: {
      type: 'object',
      properties: {
        configName: {
          type: 'string',
          example: 'Roulette Config Beginner (copy custom name)',
        },
      },
    },
    examples: {
      withName: {
        summary: 'Provide custom copy name',
        value: { configName: 'Cards Config Level 1 - Turma B' },
      },
      withoutName: {
        summary: 'No custom name (optional)',
        value: {},
      },
    },
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
