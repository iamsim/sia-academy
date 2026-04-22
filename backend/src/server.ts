import cors from 'cors'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { env } from './config/env.js'
import { initDb } from './db/init.js'
import { pool } from './db/pool.js'
import { swaggerSpec } from './docs/swagger.js'
import { attendanceRouter } from './routes/attendance.js'
import { eventsRouter } from './routes/events.js'
import { paymentsRouter } from './routes/payments.js'
import { studentsRouter } from './routes/students.js'

async function start() {
  await initDb()

  const app = express()
  app.use(express.json())
  app.use(
    cors({
      origin: env.frontendOrigin,
      credentials: true,
    }),
  )

  app.get('/health', (_req, res) => {
    res.json({ ok: true })
  })

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  app.use('/api/students', studentsRouter)
  app.use('/api/payments', paymentsRouter)
  app.use('/api/events', eventsRouter)
  app.use('/api/attendance', attendanceRouter)

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
