import { Router } from 'express'
import { z } from 'zod'
import { hashPassword } from '../auth/password.js'
import { pool } from '../db/pool.js'

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().optional().default(''),
  role: z.enum(['All', 'Admin', 'Instructor', 'Member']).default('All'),
})

const memberRoleSchema = z.enum(['Admin', 'Instructor', 'Member'])

function normalizePhone(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (typeof value !== 'string') return null
  const t = value.trim()
  return t === '' ? null : t
}

const createMemberSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1),
  phone: z.union([z.string(), z.null()]).optional(),
  role: memberRoleSchema,
  isActive: z.boolean().default(true),
  password: z.string().min(6),
})

const updateMemberSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1),
  phone: z.union([z.string(), z.null()]),
  role: memberRoleSchema,
  isActive: z.boolean(),
  password: z.string().optional(),
})

const idParamSchema = z.coerce.number().int().positive()

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === '23505'
  )
}

export const membersRouter = Router()

membersRouter.get('/', async (req, res, next) => {
  try {
    const q = listQuerySchema.parse(req.query)
    const offset = (q.page - 1) * q.pageSize
    const term = q.search.trim()

    const whereParts: string[] = ['TRUE']
    const whereParams: unknown[] = []
    let p = 1

    if (term.length > 0) {
      whereParts.push(
        `(email ILIKE $${p} OR display_name ILIKE $${p} OR COALESCE(phone, '') ILIKE $${p})`,
      )
      whereParams.push(`%${term}%`)
      p += 1
    }
    if (q.role !== 'All') {
      whereParts.push(`role = $${p}`)
      whereParams.push(q.role)
      p += 1
    }

    const whereSql = whereParts.join(' AND ')

    const countResult = await pool.query<{ count: number }>(
      `SELECT COUNT(*)::int AS count FROM members WHERE ${whereSql}`,
      whereParams,
    )
    const total = countResult.rows[0]?.count ?? 0

    const limitIdx = p
    const offsetIdx = p + 1
    const listResult = await pool.query(
      `SELECT id,
              email,
              display_name AS "displayName",
              phone,
              role,
              is_active AS "isActive"
       FROM members
       WHERE ${whereSql}
       ORDER BY id DESC
       LIMIT $${limitIdx}::int OFFSET $${offsetIdx}::int`,
      [...whereParams, q.pageSize, offset],
    )

    res.json({
      items: listResult.rows,
      total,
      page: q.page,
      pageSize: q.pageSize,
    })
  } catch (error) {
    next(error)
  }
})

membersRouter.post('/', async (req, res, next) => {
  try {
    const raw = createMemberSchema.parse(req.body)
    const phone = normalizePhone(raw.phone)
    const passwordHash = hashPassword(raw.password)
    const result = await pool.query(
      `INSERT INTO members (email, display_name, phone, role, is_active, password_hash)
       VALUES (lower(trim($1)), $2, $3, $4, $5, $6)
       RETURNING id, email, display_name AS "displayName", phone, role, is_active AS "isActive"`,
      [raw.email, raw.displayName.trim(), phone, raw.role, raw.isActive, passwordHash],
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    if (isUniqueViolation(error)) {
      res.status(409).json({ message: 'That email is already in use.' })
      return
    }
    next(error)
  }
})

membersRouter.put('/:id', async (req, res, next) => {
  try {
    const idParse = idParamSchema.safeParse(req.params.id)
    if (!idParse.success) {
      res.status(400).json({ message: 'Invalid member id' })
      return
    }
    const id = idParse.data
    const raw = updateMemberSchema.parse(req.body)
    const phone = normalizePhone(raw.phone)
    const newPassword = raw.password?.trim()
    const hasNewPassword = Boolean(newPassword && newPassword.length > 0)

    const returning = `RETURNING id, email, display_name AS "displayName", phone, role, is_active AS "isActive"`

    try {
      if (hasNewPassword) {
        const passwordHash = hashPassword(newPassword!)
        const result = await pool.query(
          `UPDATE members SET
             email = lower(trim($1)),
             display_name = $2,
             phone = $3,
             role = $4,
             is_active = $5,
             password_hash = $6
           WHERE id = $7
           ${returning}`,
          [
            raw.email,
            raw.displayName.trim(),
            phone,
            raw.role,
            raw.isActive,
            passwordHash,
            id,
          ],
        )
        if (result.rowCount === 0) {
          res.status(404).json({ message: 'Member not found' })
          return
        }
        res.json(result.rows[0])
        return
      }

      const result = await pool.query(
        `UPDATE members SET
           email = lower(trim($1)),
           display_name = $2,
           phone = $3,
           role = $4,
           is_active = $5
         WHERE id = $6
         ${returning}`,
        [raw.email, raw.displayName.trim(), phone, raw.role, raw.isActive, id],
      )
      if (result.rowCount === 0) {
        res.status(404).json({ message: 'Member not found' })
        return
      }
      res.json(result.rows[0])
    } catch (error) {
      if (isUniqueViolation(error)) {
        res.status(409).json({ message: 'That email is already in use.' })
        return
      }
      throw error
    }
  } catch (error) {
    next(error)
  }
})
