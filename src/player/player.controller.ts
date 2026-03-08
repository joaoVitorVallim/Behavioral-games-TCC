import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { PlayerService } from './player.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';

@ApiTags('Players')
@ApiBearerAuth()
@Controller('players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Post()
  @ApiOperation({
    summary: 'Create new player',
    description: 'Registers a new player/student in a session',
  })
  @ApiResponse({
    status: 201,
    description: 'Player created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - invalid session_id',
  })
  create(@Body() createPlayerDto: CreatePlayerDto) {
    return this.playerService.create(createPlayerDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get player details',
    description: 'Returns complete information of a specific player',
  })
  @ApiParam({
    name: 'id',
    description: 'Player ID',
    example: 'e7fb8887-9739-4aab-8934-df34707d8d98',
  })
  @ApiResponse({
    status: 200,
    description: 'Player found',
  })
  @ApiResponse({
    status: 404,
    description: 'Player not found',
  })
  findOne(@Param('id') id: string) {
    return this.playerService.findOne(id);
  }
  
  @Patch(':id')
  @ApiOperation({
    summary: 'Update player',
    description: 'Updates information of an existing player',
  })
  @ApiParam({
    name: 'id',
    description: 'Player ID',
    example: 'e7fb8887-9739-4aab-8934-df34707d8d98',
  })
  @ApiResponse({
    status: 200,
    description: 'Player updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Player not found',
  })
  update(@Param('id') id: string, @Body() updatePlayerDto: UpdatePlayerDto) {
    return this.playerService.update(id, updatePlayerDto);
  }
  
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete player',
    description: 'Removes a player from the system',
  })
  @ApiParam({
    name: 'id',
    description: 'Player ID',
    example: 'e7fb8887-9739-4aab-8934-df34707d8d98',
  })
  @ApiResponse({
    status: 200,
    description: 'Player deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Player not found',
  })
  remove(@Param('id') id: string) {
    return this.playerService.remove(id);
  }

  @Get()
  @ApiOperation({
    summary: 'List all players',
    description: 'Returns list of players, optionally filtered by session',
  })
  @ApiQuery({
    name: 'sessionId',
    required: false,
    description: 'Filter by session ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of players returned successfully',
  })
  findAll(@Query('sessionId') sessionId?: string) {
    return this.playerService.findAll(sessionId);
  }

  @Get('session/:sessionId')
  @ApiOperation({
    summary: 'List players in a session',
    description: 'Returns all players participating in a specific session',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Session ID',
    example: 'd7fb8887-9739-4aab-8934-df34707d8d98',
  })
  @ApiResponse({
    status: 200,
    description: 'Session players returned successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found',
  })
  findBySession(@Param('sessionId') sessionId: string) {
    return this.playerService.findBySession(sessionId);
  }
}
