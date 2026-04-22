import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool.js';
const eventInputSchema = z.object({
    eventName: z.string().min(1),
    place: z.string().min(1),
    date: z.string().min(1),
    time: z.string().min(1),
    description: z.string().min(1),
});
export const eventsRouter = Router();
eventsRouter.get('/', async (_req, res, next) => {
    try {
        const result = await pool.query(`
      SELECT id, event_name AS "eventName", place, date::text AS date, time, description
      FROM events
      ORDER BY date ASC, id ASC
    `);
        res.json(result.rows);
    }
    catch (error) {
        next(error);
    }
});
eventsRouter.post('/', async (req, res, next) => {
    try {
        const payload = eventInputSchema.parse(req.body);
        const result = await pool.query(`INSERT INTO events (event_name, place, date, time, description)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, event_name AS "eventName", place, date::text AS date, time, description`, [payload.eventName, payload.place, payload.date, payload.time, payload.description]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        next(error);
    }
});
