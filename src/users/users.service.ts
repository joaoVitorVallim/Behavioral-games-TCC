import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existingUser = await this.repository.findOne({
      where: { login: dto.login },
    });

    if (existingUser) {
      throw new ConflictException('Login already exists');
    }

    const password_hash = await bcrypt.hash(dto.password, 10);

    const user = this.repository.create({
      name: dto.name,
      login: dto.login,
      password_hash,
    });

    return await this.repository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.repository.find();
  }

  async findOne(id: string): Promise<User> {
   const  user = await this.repository.findOne({ where: { id } });
    console.log(User)
    if (!user){
      throw new NotFoundException('User not exists')
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (!user){
      throw new NotFoundException('User not exists');
    }

    if (dto.name) user.name = dto.name;
    if (dto.login) {
      const existingLogin = await this.repository.findOne({
        where: { login: dto.login },
      });
      if (existingLogin && existingLogin.id !== id) {
        throw new ConflictException('Login already exists');
      }
      user.login = dto.login;
    }
    if (dto.password) {
      user.password_hash = await bcrypt.hash(dto.password, 10);
    }

    return await this.repository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException('User not exists')
    }

    await this.repository.delete(id);
  }

  async findByLogin(login: string): Promise<User> {

    const user = await this.repository.findOne({ where: { login } });
    
    if (!user) {
      throw new NotFoundException('User not exists')
    }

    return user
  }
}
