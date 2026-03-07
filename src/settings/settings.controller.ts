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
    summary: 'Criar nova configuração de jogo',
    description: 'Cria uma nova preset de configurações para um tipo de jogo (Cards ou Words)',
  })
  @ApiResponse({
    status: 201,
    description: 'Configuração criada com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de validação - dados inválidos',
  })
  create(@Body() createSettingsDto: CreateSettingsDto) {
    return this.settingsService.create(createSettingsDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas as configurações',
    description: 'Retorna lista de todas as configurações, opcionalmente filtradas por tipo de jogo',
  })
  @ApiQuery({
    name: 'jogo',
    required: false,
    enum: ['cards', 'words'],
    description: 'Filtrar por tipo de jogo',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de configurações retornada com sucesso',
  })
  findAll(@Query('jogo') jogo?: GameType) {
    return this.settingsService.findAll(jogo);
  }

  @Get('game/:jogo')
  @ApiOperation({
    summary: 'Listar configurações por tipo de jogo',
    description: 'Retorna todas as configurações para um tipo de jogo específico',
  })
  @ApiParam({
    name: 'jogo',
    enum: ['cards', 'words'],
    description: 'Tipo do jogo',
  })
  @ApiResponse({
    status: 200,
    description: 'Configurações retornadas com sucesso',
  })
  findByGame(@Param('jogo') jogo: GameType) {
    return this.settingsService.findByGame(jogo);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obter detalhes da configuração',
    description: 'Retorna informações completas de uma configuração específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da configuração',
    example: 'c7fb8887-9739-4aab-8934-df34707d8d98',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuração encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Configuração não encontrada',
  })
  findOne(@Param('id') id: string) {
    return this.settingsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar configuração',
    description: 'Atualiza parâmetros de uma configuração existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da configuração',
    example: 'c7fb8887-9739-4aab-8934-df34707d8d98',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuração atualizada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Configuração não encontrada',
  })
  update(
    @Param('id') id: string,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ) {
    return this.settingsService.update(id, updateSettingsDto);
  }

  @Post(':id/copy')
  @ApiOperation({
    summary: 'Duplicar configuração',
    description: 'Cria uma cópia de uma configuração existente com novo nome',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da configuração a ser copiada',
    example: 'c7fb8887-9739-4aab-8934-df34707d8d98',
  })
  @ApiResponse({
    status: 201,
    description: 'Configuração copiada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Configuração não encontrada',
  })
  createCopy(
    @Param('id') id: string,
    @Body('configName') configName?: string,
  ) {
    return this.settingsService.createCopy(id, configName);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Deletar configuração',
    description: 'Remove uma configuração do sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da configuração',
    example: 'c7fb8887-9739-4aab-8934-df34707d8d98',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuração deletada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Configuração não encontrada',
  })
  remove(@Param('id') id: string) {
    return this.settingsService.remove(id);
  }
}
