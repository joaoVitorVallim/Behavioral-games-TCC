import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './session.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) {}

  async create(createSessionDto: CreateSessionDto): Promise<Session> {
    const session = this.sessionRepository.create(createSessionDto);
    return await this.sessionRepository.save(session);
  }

  async findAll(): Promise<Session[]> {
    return await this.sessionRepository.find({
      relations: ['game', 'settings', 'user'],
    });
  }

  async findOne(id: string): Promise<Session | null> {
    return await this.sessionRepository.findOne({
      where: { id },
      relations: ['game', 'settings', 'user', 'matches'],
    });
  }

  async findByCode(inviteCode: string): Promise<Session | null> {
    return await this.sessionRepository.findOne({
      where: { inviteCode },
      relations: ['game', 'settings'],
    });
  }

  async update(id: string, updateSessionDto: UpdateSessionDto): Promise<Session | null> {
    await this.sessionRepository.update(id, updateSessionDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.sessionRepository.delete(id);
  }
}
