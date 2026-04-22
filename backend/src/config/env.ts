import dotenv from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** `backend/` — stable regardless of `process.cwd()` (repo root vs package root). */
const packageRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

function loadEnvFiles() {
  const envFile = path.join(packageRoot, '.env')
  if (fs.existsSync(envFile)) {
    dotenv.config({ path: envFile })
  } else {
    dotenv.config()
  }
}

loadEnvFiles()

const defaultDbUser = process.env.USER ?? process.env.USERNAME ?? 'postgres'
const defaultDatabaseUrl = `postgresql://${defaultDbUser}@localhost:5432/sia_academy`

export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? defaultDatabaseUrl,
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
}
