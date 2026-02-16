import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { JoinSessionDto } from './dto/join-session.dto';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  create(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionService.create(createSessionDto);
  }

  @Get()
  findAll() {
    return this.sessionService.findAll();
  }

  @Get('codigo/:codigo')
  findByCode(@Param('codigo') codigo: string) {
    return this.sessionService.findByCode(codigo);
  }

  @Post(':inviteCode/join')
  joinSession(
    @Param('inviteCode') inviteCode: string,
    @Body() joinSessionDto: JoinSessionDto,
  ) {
    return this.sessionService.joinSession(inviteCode, joinSessionDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSessionDto: UpdateSessionDto) {
    return this.sessionService.update(id, updateSessionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sessionService.remove(id);
  }

  @Get(':id/results')
  getResults(@Param('id') id: string) {
    return this.sessionService.getResults(id);
  }

  @Get(':id/export')
  async exportData(@Param('id') id: string, @Res() res: Response) {
    const { csv, filename } = await this.sessionService.exportData(id);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }
}
