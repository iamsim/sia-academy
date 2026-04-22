import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool.js';
const paymentInputSchema = z.object({
    studentId: z.number().int().positive().nullable(),
    paymentMode: z.enum(['UPI', 'Cash', 'Card', 'Bank Transfer']),
    amount: z.number().positive(),
    paymentDate: z.string().min(1),
    receipt: z.string().min(1),
});
export const paymentsRouter = Router();
paymentsRouter.get('/', async (_req, res, next) => {
    try {
        const result = await pool.query(`
      SELECT p.id, p.student_id AS "studentId", s.name AS "studentName",
             p.payment_mode AS "paymentMode", p.amount::float AS amount,
             p.payment_date::text AS "paymentDate", p.receipt
      FROM payments p
      LEFT JOIN students s ON s.id = p.student_id
      ORDER BY p.payment_date DESC, p.id DESC
    `);
        res.json(result.rows);
    }
    catch (error) {
        next(error);
    }
});
paymentsRouter.post('/', async (req, res, next) => {
    try {
        const payload = paymentInputSchema.parse(req.body);
        const result = await pool.query(`INSERT INTO payments (student_id, payment_mode, amount, payment_date, receipt)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, student_id AS "studentId", payment_mode AS "paymentMode",
                 amount::float AS amount, payment_date::text AS "paymentDate", receipt`, [
            payload.studentId,
            payload.paymentMode,
            payload.amount,
            payload.paymentDate,
            payload.receipt,
        ]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        next(error);
    }
});
