import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator';

@Controller('users')
@Roles('coordinator') // admin bypasses this via RolesGuard's superuser check
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll().then((users) => ({ users }));
  }

  @Post()
  create(@Body() dto: CreateUserDto, @CurrentUser() user: AuthUser) {
    return this.usersService.create(user, dto);
  }

  @HttpCode(200)
  @Post(':id/reset-password')
  resetPassword(
    @Param('id') id: string,
    @Body() dto: ResetPasswordDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.usersService.resetPassword(user, id, dto.newPassword);
  }
}
