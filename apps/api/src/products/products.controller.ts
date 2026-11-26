import { Controller, Delete, Get, Patch, Post } from '@nestjs/common'
import {
  createProductSchema,
  productQuerySchema,
  updateProductSchema,
  type CreateProductInput,
  type UpdateProductInput,
} from '@zawabu/shared'
import { z } from 'zod'

import { Public, Roles } from '../common/auth.decorators'
import { ZodBody, ZodParam, ZodQuery } from '../common/zod-params'
import { ProductsService } from './products.service'

const idSchema = z.object({ id: z.uuid() })

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  findAll(
    @ZodQuery(productQuerySchema) query: z.infer<typeof productQuerySchema>,
  ) {
    return this.productsService.findAll(query)
  }

  @Get('low-stock')
  findLowStock() {
    return this.productsService.findLowStock()
  }

  @Public()
  @Get(':id')
  findOne(@ZodParam(idSchema) params: z.infer<typeof idSchema>) {
    return this.productsService.findOne(params.id)
  }

  @Post()
  @Roles('SUPER_ADMIN', 'SALES_MANAGER', 'SALES_PERSON')
  create(@ZodBody(createProductSchema) body: CreateProductInput) {
    return this.productsService.create(body)
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'SALES_MANAGER', 'SALES_PERSON')
  update(
    @ZodParam(idSchema) params: z.infer<typeof idSchema>,
    @ZodBody(updateProductSchema) body: UpdateProductInput,
  ) {
    return this.productsService.update(params.id, body)
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'SALES_MANAGER')
  async remove(@ZodParam(idSchema) params: z.infer<typeof idSchema>) {
    await this.productsService.remove(params.id)
    return { deleted: true }
  }
}
