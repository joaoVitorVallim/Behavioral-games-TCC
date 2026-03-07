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
    summary: 'Criar novo jogador',
    description: 'Registra um novo jogador/aluno em uma sessão',
  })
  @ApiResponse({
    status: 201,
    description: 'Jogador criado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de validação - session_id inválido',
  })
  create(@Body() createPlayerDto: CreatePlayerDto) {
    return this.playerService.create(createPlayerDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obter detalhes do jogador',
    description: 'Retorna informações completas de um jogador específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do jogador',
    example: 'e7fb8887-9739-4aab-8934-df34707d8d98',
  })
  @ApiResponse({
    status: 200,
    description: 'Jogador encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Jogador não encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.playerService.findOne(id);
  }
  
  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar jogador',
    description: 'Atualiza informações de um jogador existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do jogador',
    example: 'e7fb8887-9739-4aab-8934-df34707d8d98',
  })
  @ApiResponse({
    status: 200,
    description: 'Jogador atualizado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Jogador não encontrado',
  })
  update(@Param('id') id: string, @Body() updatePlayerDto: UpdatePlayerDto) {
    return this.playerService.update(id, updatePlayerDto);
  }
  
  @Delete(':id')
  @ApiOperation({
    summary: 'Deletar jogador',
    description: 'Remove um jogador do sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do jogador',
    example: 'e7fb8887-9739-4aab-8934-df34707d8d98',
  })
  @ApiResponse({
    status: 200,
    description: 'Jogador deletado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Jogador não encontrado',
  })
  remove(@Param('id') id: string) {
    return this.playerService.remove(id);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos os jogadores',
    description: 'Retorna lista de jogadores, opcionalmente filtrados por sessão',
  })
  @ApiQuery({
    name: 'sessionId',
    required: false,
    description: 'Filtrar por ID da sessão',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de jogadores retornada com sucesso',
  })
  findAll(@Query('sessionId') sessionId?: string) {
    return this.playerService.findAll(sessionId);
  }

  @Get('session/:sessionId')
  @ApiOperation({
    summary: 'Listar jogadores de uma sessão',
    description: 'Retorna todos os jogadores participantes de uma sessão específica',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'ID da sessão',
    example: 'd7fb8887-9739-4aab-8934-df34707d8d98',
  })
  @ApiResponse({
    status: 200,
    description: 'Jogadores da sessão retornados com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Sessão não encontrada',
  })
  findBySession(@Param('sessionId') sessionId: string) {
    return this.playerService.findBySession(sessionId);
  }
}
