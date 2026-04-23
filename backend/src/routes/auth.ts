import { Router } from 'express'
import { z } from 'zod'
import { verifyPassword } from '../auth/password.js'
import { pool } from '../db/pool.js'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const authRouter = Router()

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body)
    const result = await pool.query<{
      email: string
      displayName: string
      passwordHash: string
      isActive: boolean
    }>(
      `SELECT email,
              display_name AS "displayName",
              password_hash AS "passwordHash",
              is_active AS "isActive"
       FROM members
       WHERE lower(email) = lower($1)`,
      [email],
    )
    const row = result.rows[0]
    if (!row || !row.isActive || !verifyPassword(password, row.passwordHash)) {
      res.status(401).json({ message: 'Invalid email or password.' })
      return
    }
    res.json({ email: row.email, displayName: row.displayName })
  } catch (error) {
    next(error)
  }
})
