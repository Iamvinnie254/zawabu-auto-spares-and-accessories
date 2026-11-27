import { BadRequestException, type PipeTransform } from "@nestjs/common";
import type { ZodType } from "zod";

export class ZodValidationPipe<T extends ZodType> implements PipeTransform {
  constructor(private readonly schema: T) {}

  async transform(value: unknown): Promise<unknown> {
    const result = await this.schema.safeParseAsync(value);
    if (result.success) {
      return result.data;
    }

    throw new BadRequestException({
      message: "Validation failed",
      errors: result.error.issues.map((issue) => ({
        path: issue.path.join(".") || "body",
        message: issue.message,
      })),
    });
  }
}
