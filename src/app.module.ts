import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'nest',
      password: 'nest',
      database: 'nest_db',
      autoLoadEntities: true,
      synchronize: true, // Tirar quando for pra produção seus baitora (ou dx tbm nessa poura)
    }),
    UsersModule
  ],
})
export class AppModule {}
