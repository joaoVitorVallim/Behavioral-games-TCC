import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MatchService } from './match.service';
import { Match, MatchStatus } from './match.entity';

@ApiTags('Matches')
@ApiBearerAuth()
@Controller('matches')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar nova partida',
    description: 'Cria uma nova partida com dois jogadores em uma sessão',
  })
  @ApiBody({
    schema: {
      example: {
        sessaoId: 'd7fb8887-9739-4aab-8934-df34707d8d98',
        player1Id: 'e7fb8887-9739-4aab-8934-df34707d8d98',
        player2Id: 'f7fb8887-9739-4aab-8934-df34707d8d98',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Partida criada com sucesso',
  })
  async create(
    @Body()
    body: {
      sessaoId: string;
      player1Id: string;
      player2Id: string;
    },
  ): Promise<Match> {
    return await this.matchService.create(body.sessaoId, body.player1Id, body.player2Id);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas as partidas',
    description: 'Retorna lista de partidas com filtros opcionais',
  })
  @ApiQuery({
    name: 'sessaoId',
    required: false,
    description: 'Filtrar por ID da sessão',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: MatchStatus,
    description: 'Filtrar por status da partida',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de partidas retornada com sucesso',
    isArray: true,
  })
  async findAll(
    @Query('sessaoId') sessaoId?: string,
    @Query('status') status?: MatchStatus,
  ): Promise<Match[]> {
    return await this.matchService.findAll({ sessaoId, status });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obter detalhes da partida',
    description: 'Retorna informações completas de uma partida específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da partida',
  })
  @ApiResponse({
    status: 200,
    description: 'Partida encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Partida não encontrada',
  })
  async findOne(@Param('id') id: string): Promise<Match | null> {
    return await this.matchService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Atualizar status da partida',
    description: 'Altera o status da partida (aguardando, em partida, finalizada, cancelada)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da partida',
  })
  @ApiBody({
    schema: {
      example: {
        status: 'em_partida',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Status atualizado com sucesso',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: MatchStatus },
  ): Promise<Match> {
    return await this.matchService.updateStatus(id, body.status);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Deletar partida',
    description: 'Remove uma partida do sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da partida',
  })
  @ApiResponse({
    status: 200,
    description: 'Partida deletada com sucesso',
  })
  async delete(@Param('id') id: string): Promise<void> {
    return await this.matchService.delete(id);
  }
}
