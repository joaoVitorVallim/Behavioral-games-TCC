import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
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
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { GameType } from '../game/games.enum';

@ApiTags('Sessions')
@ApiBearerAuth()
@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar nova sessão',
    description: 'Cria uma nova sessão com configurações específicas do jogo',
  })
  @ApiBody({ type: CreateSessionDto })
  @ApiResponse({
    status: 201,
    description: 'Sessão criada com sucesso',
    schema: {
      example: {
        id: 'd7fb8887-9739-4aab-8934-df34707d8d98',
        jogo: 'cards',
        codigo_convite: 'F4LVTX',
        isActive: true,
        created_at: '2026-03-07T17:05:59.734Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de validação ou dados inválidos',
  })
  create(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionService.create(createSessionDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas as sessões',
    description: 'Retorna lista de sessões com filtros opcionais',
  })
  @ApiQuery({
    name: 'jogo',
    required: false,
    enum: GameType,
    description: 'Filtrar por tipo de jogo',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filtrar por ID do usuário criador',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    enum: ['true', 'false'],
    description: 'Filtrar por status (ativo/inativo)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de sessões retornada com sucesso',
    isArray: true,
  })
  findAll(
    @Query('jogo') jogo?: GameType,
    @Query('userId') userId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.sessionService.findAll({
      jogo,
      userId,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  @Get('codigo/:codigo')
  @ApiOperation({
    summary: 'Buscar sessão por código de convite',
    description: 'Retorna a sessão baseada no código de convite único',
  })
  @ApiParam({
    name: 'codigo',
    description: 'Código de convite da sessão (ex: EVRF4)',
  })
  @ApiResponse({
    status: 200,
    description: 'Sessão encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Sessão não encontrada',
  })
  findByInviteCode(@Param('codigo') codigo: string) {
    return this.sessionService.findByInviteCode(codigo);
  }

  @Get('stats/:id')
  @ApiOperation({
    summary: 'Obter estatísticas da sessão',
    description: 'Retorna informações e estatísticas completas da sessão',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da sessão',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas retornadas com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Sessão não encontrada',
  })
  getStats(@Param('id') id: string) {
    return this.sessionService.getSessionStats(id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obter detalhes da sessão',
    description: 'Retorna informações completas de uma sessão específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da sessão',
  })
  @ApiResponse({
    status: 200,
    description: 'Sessão encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Sessão não encontrada',
  })
  findOne(@Param('id') id: string) {
    return this.sessionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar sessão',
    description: 'Atualiza dados da sessão (ex: ativar/desativar)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da sessão',
  })
  @ApiBody({ type: UpdateSessionDto })
  @ApiResponse({
    status: 200,
    description: 'Sessão atualizada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Sessão não encontrada',
  })
  update(
    @Param('id') id: string,
    @Body() updateSessionDto: UpdateSessionDto,
  ) {
    return this.sessionService.update(id, updateSessionDto);
  }

  @Post(':id/finish')
  @ApiOperation({
    summary: 'Finalizar sessão',
    description: 'Marca a sessão como finalizada',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da sessão',
  })
  @ApiResponse({
    status: 201,
    description: 'Sessão finalizada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Sessão não encontrada',
  })
  finish(@Param('id') id: string) {
    return this.sessionService.finish(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Deletar sessão',
    description: 'Remove uma sessão do sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da sessão',
  })
  @ApiResponse({
    status: 200,
    description: 'Sessão deletada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Sessão não encontrada',
  })
  remove(@Param('id') id: string) {
    return this.sessionService.remove(id);
  }
}
