import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { hash } from "bcryptjs";
import type { CreateUserInput, UpdateUserInput } from "@zawabu/shared";
import { and, eq } from "drizzle-orm";

import { DRIZZLE } from "../db/db.module";
import { users, type Database, type UserRow } from "../db/schema";

const publicFields = {
  id: users.id,
  name: users.name,
  email: users.email,
  role: users.role,
  isActive: users.isActive,
  createdAt: users.createdAt,
};

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly config: ConfigService,
  ) {}

  async findById(id: string): Promise<UserRow | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async findByEmail(email: string): Promise<UserRow | undefined> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);
    return user;
  }

  async list() {
    return this.db.select(publicFields).from(users).orderBy(users.createdAt);
  }

  async create(input: CreateUserInput) {
    const existing = await this.findByEmail(input.email);
    if (existing) {
      throw new BadRequestException("A user with that email already exists");
    }

    const rounds = this.config.get<number>("BCRYPT_ROUNDS") ?? 12;
    const [created] = await this.db
      .insert(users)
      .values({
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash: await hash(input.password, rounds),
        role: input.role,
      })
      .returning(publicFields);

    return created;
  }

  async update(id: string, input: UpdateUserInput) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (
      user.role === "SUPER_ADMIN" &&
      (input.role === "SALES_MANAGER" || input.role === "SALES_PERSON" || input.isActive === false)
    ) {
      await this.ensureAnotherSuperAdminExists(id);
    }

    const [updated] = await this.db
      .update(users)
      .set({
        ...(input.name ? { name: input.name } : {}),
        ...(input.email ? { email: input.email.toLowerCase() } : {}),
        ...(input.role ? { role: input.role } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        ...(input.password ? { passwordHash: await this.hashPassword(input.password) } : {}),
      })
      .where(eq(users.id, id))
      .returning(publicFields);

    return updated;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.role === "SUPER_ADMIN") {
      await this.ensureAnotherSuperAdminExists(id);
    }

    const deleted = await this.db.delete(users).where(eq(users.id, id)).returning({ id: users.id });

    if (!deleted.length) {
      throw new NotFoundException("User not found");
    }
  }

  private async hashPassword(password: string): Promise<string> {
    return hash(password, this.config.get<number>("BCRYPT_ROUNDS") ?? 12);
  }

  private async ensureAnotherSuperAdminExists(excludedId: string): Promise<void> {
    const admins = await this.db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.role, "SUPER_ADMIN"), eq(users.isActive, true)));

    if (!admins.some((admin) => admin.id !== excludedId)) {
      throw new BadRequestException("At least one active super admin must remain");
    }
  }
}
