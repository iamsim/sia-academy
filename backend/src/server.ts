import cors from 'cors'
import express, { type Router } from 'express'
import swaggerUi from 'swagger-ui-express'
import { env } from './config/env.js'
import { initDb } from './db/init.js'
import { pool } from './db/pool.js'
import { swaggerSpec } from './docs/swagger.js'
import { attendanceRouter } from './routes/attendance.js'
import { authRouter } from './routes/auth.js'
import { eventsRouter } from './routes/events.js'
import { membersRouter } from './routes/members.js'
import { paymentsRouter } from './routes/payments.js'
import { studentsRouter } from './routes/students.js'

/** Expose routes under `/api{basePath}` (used by the Vite app) and under `{basePath}` for direct calls. */
function mountApiRoutes(app: express.Application, basePath: string, router: Router) {
  app.use(`/api${basePath}`, router)
  app.use(basePath, router)
}

function normalizeOrigin(origin: string) {
  return origin.replace(/\/+$/, '')
}

async function start() {
  await initDb()

  const app = express()
  app.use(express.json())
  const allowedOrigins = new Set(env.frontendOrigins.map(normalizeOrigin))
  app.use(
    cors({
      origin(origin, callback) {
        // Allow non-browser tools (curl, server-to-server) that send no Origin header.
        if (!origin) {
          callback(null, true)
          return
        }
        if (allowedOrigins.has(normalizeOrigin(origin))) {
          callback(null, true)
          return
        }
        callback(new Error(`CORS blocked for origin: ${origin}`))
      },
      credentials: true,
    }),
  )

  app.get('/health', (_req, res) => {
    res.json({ ok: true })
  })

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  mountApiRoutes(app, '/auth', authRouter)
  mountApiRoutes(app, '/members', membersRouter)
  mountApiRoutes(app, '/students', studentsRouter)
  mountApiRoutes(app, '/payments', paymentsRouter)
  mountApiRoutes(app, '/events', eventsRouter)
  mountApiRoutes(app, '/attendance', attendanceRouter)

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err)
    if (err instanceof Error) {
      res.status(400).json({ message: err.message })
      return
    }
    res.status(500).json({ message: 'Internal server error' })
  })

  const server = app.listen(env.port, () => {
    console.log(`API server running on http://localhost:${env.port}`)
    console.log(`Swagger docs at http://localhost:${env.port}/docs`)
  })

  const shutdown = async () => {
    server.close()
    await pool.end()
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

start().catch((error) => {
  console.error('Failed to start server', error)
  process.exit(1)
})
