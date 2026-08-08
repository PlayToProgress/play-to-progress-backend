import { Controller, Get } from '@nestjs/common';
import { ParentsService } from './parents.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('parents')
@Roles('coordinator')
export class ParentsController {
  constructor(private parentsService: ParentsService) {}

  @Get()
  async findAll() {
    return { parents: await this.parentsService.findAll() };
  }
}
