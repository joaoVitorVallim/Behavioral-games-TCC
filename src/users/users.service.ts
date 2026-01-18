import { Injectable } from '@nestjs/common';
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


async create(dto: CreateUserDto) {
  const hashedPassword = await bcrypt.hash(dto.password, 10);

  const user = this.repository.create({
    ...dto,
    password: hashedPassword,
  });

  return await this.repository.save(user);
}


  async findAll() {
    return await this.repository.find();
  }


  async update(id: number, dto: UpdateUserDto) {
    return await this.repository.update(id, dto);
  }


  async findByEmail(email: string) {
    return this.repository.findOne({
      where: { email }
    });
  }
}
