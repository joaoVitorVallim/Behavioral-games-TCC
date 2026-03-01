import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findAll(sessionId?: string): Promise<Player[]> {
    if (sessionId) {
      return await this.playerRepository.find({
        where: { session_id: sessionId },
        relations: ['session'],
      });
    }
    return await this.playerRepository.find({ relations: ['session'] });
  }

  async findOne(id: string): Promise<Player> {
    const player = await this.playerRepository.findOne({
      where: { id },
      relations: ['session'],
    });

    if (!player) {
      throw new NotFoundException(`Player with ID ${id} not found`);
    }

    return player;
  }

  async update(id: string, updatePlayerDto: UpdatePlayerDto): Promise<Player> {
    const player = await this.findOne(id);

    Object.assign(player, updatePlayerDto);

    return await this.playerRepository.save(player);
  }

  async remove(id: string): Promise<void> {
    await this.playerRepository.delete(id);
  }

  async findBySession(sessionId: string): Promise<Player[]> {
    return await this.playerRepository.find({
      where: { session_id: sessionId },
      relations: ['session'],
    });
  }
}
