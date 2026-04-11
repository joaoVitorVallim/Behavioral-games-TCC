import { Controller, Get, Param, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { GameService } from './game.service';
import { GameType } from './games.enum';

@ApiTags('Games')
@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get()
  @ApiOperation({
    summary: 'List all available games',
    description: 'Returns information about all games implemented in the system',
  })
  @ApiResponse({
    status: 200,
    description: 'Games list returned successfully',
    schema: {
      example: [
        {
          id: 'prisoner',
          name: "Prisoner's Dilemma",
          description: "A behavioral game based on the classic Prisoner's Dilemma theory",
          redirectUrl: 'http://localhost:3001',
        },
        {
          id: 'roulette',
          name: 'Roulette Betting Game',
          description: 'A roulette-style betting game',
          redirectUrl: 'https://roulette-game.example.com',
        },
      ],
    },
  })
  findAll() {
    return this.gameService.findAll();
  }

  @Get(':game_name')
  @ApiOperation({
    summary: 'Get specific game information',
    description: 'Returns details and redirect URL for a game',
  })
  @ApiParam({
    name: 'game_name',
    enum: ['prisoner', 'roulette'],
    description: 'Game type',
  })
  @ApiResponse({
    status: 200,
    description: 'Game information returned successfully',
    schema: {
      example: {
        id: 'prisoner',
        name: "Prisoner's Dilemma",
        description: "A behavioral game based on the classic Prisoner's Dilemma theory",
        redirectUrl: 'http://localhost:3001',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid game type',
  })
  findOne(@Param('game_name') id: string) {
    if (!this.gameService.isValidGameType(id)) {
      throw new BadRequestException(`Invalid game type: ${id}`);
    }
    const game = this.gameService.findOne(id as GameType);
    return game;
  }
}
