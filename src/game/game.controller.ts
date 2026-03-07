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
    summary: 'Listar todos os jogos disponíveis',
    description: 'Retorna informações de todos os jogos implementados no sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de jogos retornada com sucesso',
    schema: {
      example: [
        {
          id: 'cards',
          nome: 'Jogo de Cartas',
          descricao: 'Um jogo de cartas estratégico e educativo',
          redirectUrl: 'https://cards-game.example.com',
        },
        {
          id: 'words',
          nome: 'Jogo de Palavras',
          descricao: 'Um jogo de palavras para desenvolvimento de vocabulário',
          redirectUrl: 'https://words-game.example.com',
        },
      ],
    },
  })
  findAll() {
    return this.gameService.findAll();
  }

  @Get(':game_name')
  @ApiOperation({
    summary: 'Obter informações de um jogo específico',
    description: 'Retorna detalhes e URL de redirecionamento para um jogo',
  })
  @ApiParam({
    name: 'game_name',
    enum: ['cards', 'words'],
    description: 'Tipo do jogo',
  })
  @ApiResponse({
    status: 200,
    description: 'Informações do jogo retornadas com sucesso',
    schema: {
      example: {
        id: 'cards',
        nome: 'Jogo de Cartas',
        descricao: 'Um jogo de cartas estratégico e educativo',
        redirectUrl: 'https://cards-game.example.com',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Tipo de jogo inválido',
  })
  findOne(@Param('game_name') id: string) {
    if (!this.gameService.isValidGameType(id)) {
      throw new BadRequestException(`Invalid game type: ${id}`);
    }
    const game = this.gameService.findOne(id as GameType);
    return game;
  }
}
