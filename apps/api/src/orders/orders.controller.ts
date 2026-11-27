import { Controller, Get, Patch, Post } from "@nestjs/common";
import {
  createOrderSchema,
  orderQuerySchema,
  trackOrderSchema,
  updateOrderSchema,
  type CreateOrderInput,
  type OrderQuery,
  type TrackOrderInput,
  type UpdateOrderInput,
} from "@zawabu/shared";
import { z } from "zod";

import { Public, Roles } from "../common/auth.decorators";
import { ZodBody, ZodParam, ZodQuery } from "../common/zod-params";
import { OrdersService } from "./orders.service";

const idSchema = z.object({ id: z.uuid() });

@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Public()
  @Post()
  create(@ZodBody(createOrderSchema) body: CreateOrderInput) {
    return this.ordersService.create(body);
  }

  @Public()
  @Get("track")
  track(@ZodQuery(trackOrderSchema) query: TrackOrderInput) {
    return this.ordersService.track(query.orderNumber, query.phone);
  }

  @Get()
  findAll(@ZodQuery(orderQuerySchema) query: OrderQuery) {
    return this.ordersService.findAll(query.status);
  }

  @Get(":id")
  findOne(@ZodParam(idSchema) params: z.infer<typeof idSchema>) {
    return this.ordersService.findOne(params.id);
  }

  @Patch(":id")
  @Roles("SUPER_ADMIN", "SALES_MANAGER", "SALES_PERSON")
  update(
    @ZodParam(idSchema) params: z.infer<typeof idSchema>,
    @ZodBody(updateOrderSchema) body: UpdateOrderInput,
  ) {
    return this.ordersService.update(params.id, body);
  }
}
