import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './game.entity';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
  ) {}

  async create(createGameDto: CreateGameDto): Promise<Game> {
    const game = this.gameRepository.create(createGameDto);
    return await this.gameRepository.save(game);
  }

  async findAll(): Promise<Game[]> {
    return await this.gameRepository.find();
  }

  async findOne(id: string): Promise<Game | null> {
    return await this.gameRepository.findOne({ where: { id } });
  }

  async update(id: string, updateGameDto: UpdateGameDto): Promise<Game | null> {
    await this.gameRepository.update(id, updateGameDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.gameRepository.delete(id);
  }
}
