import { Controller, Get } from '@nestjs/common';
import { PartnerOrgsService } from './partner-orgs.service';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator';

@Controller('partner-orgs')
export class PartnerOrgsController {
  constructor(private partnerOrgsService: PartnerOrgsService) {}

  @Roles('coordinator')
  @Get()
  async findAll() {
    return { partnerOrgs: await this.partnerOrgsService.findAll() };
  }

  @Roles('partner')
  @Get('me')
  async me(@CurrentUser() user: AuthUser) {
    return { partnerOrg: await this.partnerOrgsService.findByUserId(user.id) };
  }
}
