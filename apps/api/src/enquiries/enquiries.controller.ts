import { Controller, Get, Patch, Post } from '@nestjs/common'
import {
  enquiryQuerySchema,
  enquirySchema,
  updateEnquirySchema,
  type EnquiryInput,
  type EnquiryQuery,
  type UpdateEnquiryInput,
} from '@zawabu/shared'
import { z } from 'zod'

import { Public } from '../common/auth.decorators'
import { ZodBody, ZodParam, ZodQuery } from '../common/zod-params'
import { EnquiriesService } from './enquiries.service'

const idSchema = z.object({ id: z.uuid() })

@Controller('enquiries')
export class EnquiriesController {
  constructor(private readonly enquiriesService: EnquiriesService) {}

  @Public()
  @Post()
  create(@ZodBody(enquirySchema) body: EnquiryInput) {
    return this.enquiriesService.create(body)
  }

  @Get()
  findAll(@ZodQuery(enquiryQuerySchema) query: EnquiryQuery) {
    return this.enquiriesService.findAll(query.status)
  }

  @Patch(':id')
  update(
    @ZodParam(idSchema) params: z.infer<typeof idSchema>,
    @ZodBody(updateEnquirySchema) body: UpdateEnquiryInput,
  ) {
    return this.enquiriesService.update(params.id, body)
  }
}
