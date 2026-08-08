import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../schemas/user.schema';
import { AuthUser } from '../decorators/current-user.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    const user = request.user;

    // Super admin: bypasses every @Roles() check across the entire API.
    // This is the one place that decision is made — no controller needs to
    // list 'admin' in its own @Roles(...) array.
    if (user?.role === 'admin') return true;

    // No @Roles() decorator on the handler => any authenticated user is allowed
    // (JwtAuthGuard, applied globally, has already verified the token).
    if (!requiredRoles || requiredRoles.length === 0) return true;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Forbidden for this role.');
    }
    return true;
  }
}
