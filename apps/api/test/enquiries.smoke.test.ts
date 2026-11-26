import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import request from 'supertest'
import { eq } from 'drizzle-orm'

import { AppModule } from '../src/app.module'
import { DRIZZLE } from '../src/db/db.module'
import { enquiries, type Database } from '../src/db/schema'

let app: INestApplication
let superToken: string
let enquiryId: string

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()

  app = moduleRef.createNestApplication()
  app.setGlobalPrefix('api')
  await app.init()

  const login = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({
      email: 'superadmin@zawabu.co.ke',
      password: 'ChangeMe!SuperAdmin2026',
    })
    .expect(201)
  superToken = login.body.accessToken
})

afterAll(async () => {
  if (!app) {
    return
  }
  if (enquiryId) {
    const db = app.get<Database>(DRIZZLE)
    await db.delete(enquiries).where(eq(enquiries.id, enquiryId))
  }
  await app.close()
})

describe('Enquiries API smoke', () => {
  test('public enquiry is stored and staff can mark it replied', async () => {
    await request(app.getHttpServer()).get('/api/enquiries').expect(401)

    const created = await request(app.getHttpServer())
      .post('/api/enquiries')
      .send({
        name: 'Smoke Customer',
        phone: '0722000000',
        subject: 'Brake pads for Toyota',
        message: 'Do you have front brake pads for a 2016 Toyota Corolla?',
      })
      .expect(201)

    enquiryId = created.body.id
    expect(created.body.status).toBe('New')

    const listed = await request(app.getHttpServer())
      .get('/api/enquiries?status=New')
      .set('Authorization', `Bearer ${superToken}`)
      .expect(200)
    expect(listed.body.some((item: { id: string }) => item.id === enquiryId)).toBe(true)

    const updated = await request(app.getHttpServer())
      .patch(`/api/enquiries/${enquiryId}`)
      .set('Authorization', `Bearer ${superToken}`)
      .send({ status: 'Replied' })
      .expect(200)
    expect(updated.body.status).toBe('Replied')
  })
})
