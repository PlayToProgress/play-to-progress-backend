import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userModel.findOne({
      email: email.toLowerCase().trim(),
    });
    if (!user) throw new UnauthorizedException('Incorrect email or password.');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Incorrect email or password.');

    return user;
  }

  async login(user: User) {
    const payload = {
      sub: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: payload,
    };
  }

  // Self-service: any logged-in user changes their own password, proving
  // they know the current one first.
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('Account not found.');

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestException('Current password is incorrect.');

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    return { ok: true };
  }
}
