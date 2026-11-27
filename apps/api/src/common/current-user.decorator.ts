import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { Role } from "@zawabu/shared";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser | undefined =>
    context.switchToHttp().getRequest<{ user?: AuthUser }>().user,
);
