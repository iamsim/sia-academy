import { Router } from 'express'
import { z } from 'zod'
import { pool } from '../db/pool.js'

const studentInputSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().positive(),
  belt: z.string().min(1),
  fatherName: z.string().min(1),
  motherName: z.string().min(1),
  address: z.string().min(1),
  primaryContactNumber: z.string().min(1),
})

export const studentsRouter = Router()

studentsRouter.get('/', async (_req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT id, name, age, belt, father_name AS "fatherName", mother_name AS "motherName",
             address, primary_contact_number AS "primaryContactNumber"
      FROM students
      ORDER BY id DESC
    `)
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

studentsRouter.post('/', async (req, res, next) => {
  try {
    const payload = studentInputSchema.parse(req.body)
    const result = await pool.query(
      `INSERT INTO students
       (name, age, belt, father_name, mother_name, address, primary_contact_number)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, name, age, belt, father_name AS "fatherName", mother_name AS "motherName",
                 address, primary_contact_number AS "primaryContactNumber"`,
      [
        payload.name,
        payload.age,
        payload.belt,
        payload.fatherName,
        payload.motherName,
        payload.address,
        payload.primaryContactNumber,
      ],
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    next(error)
  }
})
