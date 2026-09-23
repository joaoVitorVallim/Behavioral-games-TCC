import { Module } from '@nestjs/common';
import { SessionModule } from '../session/session.module';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { ReportXlsxService } from './report-xlsx.service';
import { MatchResultXlsxService } from './match-result-xlsx.service';

@Module({
  imports: [SessionModule],
  controllers: [MailController],
  providers: [MailService, ReportXlsxService, MatchResultXlsxService],
  exports: [MailService, ReportXlsxService, MatchResultXlsxService],
})
export class MailModule {}
