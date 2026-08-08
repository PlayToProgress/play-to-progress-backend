import { Module } from '@nestjs/common';
import { PartnerOrgsService } from './partner-orgs.service';
import { PartnerOrgsController } from './partner-orgs.controller';

@Module({
  providers: [PartnerOrgsService],
  controllers: [PartnerOrgsController],
})
export class PartnerOrgsModule {}
