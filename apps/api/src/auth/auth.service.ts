import { Inject, Injectable, type OnModuleInit, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { compare, hash } from "bcryptjs";
import type { LoginInput, Role } from "@zawabu/shared";
import { eq } from "drizzle-orm";

import { DRIZZLE } from "../db/db.module";
import { users, type Database } from "../db/schema";
import { UsersService } from "../users/users.service";
import type { AuthUser } from "../common/current-user.decorator";

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedSuperAdmin();
  }

  async login(input: LoginInput) {
    const user = await this.usersService.findByEmail(input.email);
    if (!user || !(await compare(input.password, user.passwordHash))) {
      throw new UnauthorizedException("Invalid email or password");
    }
    if (!user.isActive) {
      throw new UnauthorizedException("Account is inactive");
    }

    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: await this.jwt.signAsync(payload),
      tokenType: "Bearer",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      } satisfies AuthUser,
    };
  }

  async me(userId: string): Promise<AuthUser> {
    const user = await this.usersService.findById(userId);
    if (!user?.isActive) {
      throw new UnauthorizedException("Account is inactive or no longer exists");
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async hashPassword(password: string): Promise<string> {
    return hash(password, this.config.get<number>("BCRYPT_ROUNDS") ?? 12);
  }

  private async seedSuperAdmin(): Promise<void> {
    const email = this.config.getOrThrow<string>("SUPER_ADMIN_EMAIL");
    const password = this.config.getOrThrow<string>("SUPER_ADMIN_PASSWORD");
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      return;
    }

    const role: Role = "SUPER_ADMIN";
    await this.db
      .insert(users)
      .values({
        name: "Super Admin",
        email: email.toLowerCase(),
        passwordHash: await this.hashPassword(password),
        role,
      })
      .onConflictDoNothing({ target: users.email });

    const seeded = await this.usersService.findByEmail(email);
    if (seeded && seeded.role !== role) {
      await this.db.update(users).set({ role }).where(eq(users.id, seeded.id));
    }
  }
}
