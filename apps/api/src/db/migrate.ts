import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

const url =
  process.env.DATABASE_URL ?? 'postgres://zawabu:zawabu@localhost:5432/zawabu_dev'
const client = postgres(url, { max: 1 })

async function main(): Promise<void> {
  try {
    await migrate(drizzle(client), { migrationsFolder: './drizzle' })
    console.log('Database migrations applied')
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
