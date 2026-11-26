import { Body, Param, Query } from '@nestjs/common'
import type { ZodType } from 'zod'

import { ZodValidationPipe } from './zod-validation.pipe'

export const ZodBody = (schema: ZodType): ParameterDecorator =>
  Body(new ZodValidationPipe(schema))

export const ZodQuery = (schema: ZodType): ParameterDecorator =>
  Query(new ZodValidationPipe(schema))

export const ZodParam = (schema: ZodType): ParameterDecorator =>
  Param(new ZodValidationPipe(schema))
