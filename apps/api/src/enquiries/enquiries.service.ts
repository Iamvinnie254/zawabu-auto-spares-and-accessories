import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { EnquiryInput, EnquiryQuery, UpdateEnquiryInput } from "@zawabu/shared";
import { desc, eq } from "drizzle-orm";

import { DRIZZLE } from "../db/db.module";
import { enquiries, type Database, type EnquiryRow } from "../db/schema";

@Injectable()
export class EnquiriesService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(input: EnquiryInput): Promise<EnquiryRow> {
    const [created] = await this.db.insert(enquiries).values(input).returning();
    return created;
  }

  findAll(status?: EnquiryQuery["status"]): Promise<EnquiryRow[]> {
    return this.db
      .select()
      .from(enquiries)
      .where(status ? eq(enquiries.status, status) : undefined)
      .orderBy(desc(enquiries.createdAt));
  }

  async update(id: string, input: UpdateEnquiryInput): Promise<EnquiryRow> {
    const [updated] = await this.db
      .update(enquiries)
      .set(input)
      .where(eq(enquiries.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException("Enquiry not found");
    }

    return updated;
  }
}
