import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from '../match/match.entity';
import { Session } from '../session/session.entity';
import { MailModule } from '../mail/mail.module';
import { PrisonerGateway } from './prisoner.gateway';
import { PrisonerService } from './prisoner.service';

@Module({
  imports: [TypeOrmModule.forFeature([Match, Session]), forwardRef(() => MailModule)],
  providers: [PrisonerGateway, PrisonerService],
  exports: [PrisonerService],
})
export class PrisonerModule {}
