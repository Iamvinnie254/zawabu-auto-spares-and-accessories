import { Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from "@zawabu/shared";

import { Roles } from "../common/auth.decorators";
import { ZodBody, ZodParam } from "../common/zod-params";
import { z } from "zod";
import { UsersService } from "./users.service";

const idSchema = z.object({ id: z.uuid() });

@Controller("users")
@Roles("SUPER_ADMIN")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list() {
    return this.usersService.list();
  }

  @Post()
  create(@ZodBody(createUserSchema) body: CreateUserInput) {
    return this.usersService.create(body);
  }

  @Patch(":id")
  update(
    @ZodParam(idSchema) params: z.infer<typeof idSchema>,
    @ZodBody(updateUserSchema) body: UpdateUserInput,
  ) {
    return this.usersService.update(params.id, body);
  }

  @Delete(":id")
  async remove(@ZodParam(idSchema) params: z.infer<typeof idSchema>) {
    await this.usersService.remove(params.id);
    return { deleted: true };
  }
}
