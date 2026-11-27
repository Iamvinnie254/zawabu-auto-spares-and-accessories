import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { ROLES_KEY } from "./auth.decorators";
import type { AuthUser } from "./current-user.decorator";
import type { Role } from "@zawabu/shared";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) {
      return true;
    }

    const user = context.switchToHttp().getRequest<{ user?: AuthUser }>().user;

    if (!user || !roles.includes(user.role)) {
      throw new ForbiddenException("Insufficient permissions for this action");
    }
    return true;
  }
}
