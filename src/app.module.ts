import { Module } from '@nestjs/common';

import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';

import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';


@Module({
  imports: [
    PrismaModule, UsersModule,
  ],
  controllers: [
    UsersController,
  ],
  providers: [
    UsersService
  ],
})
export class AppModule {}
