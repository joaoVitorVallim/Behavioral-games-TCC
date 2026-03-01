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
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  create(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionService.create(createSessionDto);
  }

  @Get()
  findAll(
    @Query('gameId') gameId?: string,
    @Query('userId') userId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.sessionService.findAll({
      gameId,
      userId,
      isActive: isActive === 'true',
    });
  }

  @Get('codigo/:codigo')
  findByInviteCode(@Param('codigo') codigo: string) {
    return this.sessionService.findByInviteCode(codigo);
  }

  @Get('stats/:id')
  getStats(@Param('id') id: string) {
    return this.sessionService.getSessionStats(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessionService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSessionDto: UpdateSessionDto,
  ) {
    return this.sessionService.update(id, updateSessionDto);
  }

  @Post(':id/finish')
  finish(@Param('id') id: string) {
    return this.sessionService.finish(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sessionService.remove(id);
  }
}
