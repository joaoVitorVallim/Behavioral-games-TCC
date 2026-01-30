import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './player.entity';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
  ) {}

  async create(createPlayerDto: CreatePlayerDto): Promise<Player> {
    const player = this.playerRepository.create(createPlayerDto);
    return await this.playerRepository.save(player);
  }

  async findAll(): Promise<Player[]> {
    return await this.playerRepository.find();
  }

  async findOne(id: string): Promise<Player | null> {
    return await this.playerRepository.findOne({ where: { id } });
  }

  async update(id: string, updatePlayerDto: UpdatePlayerDto): Promise<Player | null> {
    await this.playerRepository.update(id, updatePlayerDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.playerRepository.delete(id);
  }
}
