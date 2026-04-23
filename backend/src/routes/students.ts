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

const idParamSchema = z.coerce.number().int().positive()

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

studentsRouter.put('/:id', async (req, res, next) => {
  try {
    const idParse = idParamSchema.safeParse(req.params.id)
    if (!idParse.success) {
      res.status(400).json({ message: 'Invalid student id' })
      return
    }
    const id = idParse.data
    const payload = studentInputSchema.parse(req.body)
    const result = await pool.query(
      `UPDATE students SET
         name = $1,
         age = $2,
         belt = $3,
         father_name = $4,
         mother_name = $5,
         address = $6,
         primary_contact_number = $7
       WHERE id = $8
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
        id,
      ],
    )
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Student not found' })
      return
    }
    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

studentsRouter.delete('/:id', async (req, res, next) => {
  try {
    const idParse = idParamSchema.safeParse(req.params.id)
    if (!idParse.success) {
      res.status(400).json({ message: 'Invalid student id' })
      return
    }
    const result = await pool.query('DELETE FROM students WHERE id = $1', [idParse.data])
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Student not found' })
      return
    }
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})
