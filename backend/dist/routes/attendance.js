import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool.js';
const attendanceEntrySchema = z.object({
    studentId: z.number().int().positive(),
    status: z.enum(['Present', 'Absent']),
});
const saveAttendanceSchema = z.object({
    entries: z.array(attendanceEntrySchema),
});
function normalizeDate(date) {
    return date.slice(0, 10);
}
export const attendanceRouter = Router();
attendanceRouter.get('/summary', async (req, res, next) => {
    try {
        const today = new Date().toISOString().slice(0, 10);
        const from = String(req.query.from ?? today.slice(0, 8) + '01');
        const to = String(req.query.to ?? today);
        const totalStudentsResult = await pool.query('SELECT COUNT(*)::text AS count FROM students');
        const totalStudents = Number(totalStudentsResult.rows[0]?.count ?? 0);
        const dayRows = await pool.query(`
      SELECT a.attendance_date::text AS date,
             COUNT(*) FILTER (WHERE a.status = 'Present')::text AS "attendanceCount",
             $3::text AS "totalStudents"
      FROM attendance a
      WHERE a.attendance_date BETWEEN $1::date AND $2::date
      GROUP BY a.attendance_date
      ORDER BY a.attendance_date DESC
      `, [from, to, totalStudents]);
        const dayMap = new Map(dayRows.rows.map((row) => [
            normalizeDate(row.date),
            {
                date: normalizeDate(row.date),
                attendanceCount: Number(row.attendanceCount),
                totalStudents: Number(row.totalStudents),
            },
        ]));
        const records = [];
        for (let d = new Date(`${to}T00:00:00`); d >= new Date(`${from}T00:00:00`); d.setDate(d.getDate() - 1)) {
            const date = d.toISOString().slice(0, 10);
            records.push(dayMap.get(date) ?? {
                date,
                attendanceCount: 0,
                totalStudents,
            });
        }
        const todayRecord = records.find((row) => row.date === today);
        const monthPrefix = today.slice(0, 7);
        const monthCount = records
            .filter((row) => row.date.startsWith(monthPrefix))
            .reduce((sum, row) => sum + row.attendanceCount, 0);
        res.json({
            todayCount: todayRecord?.attendanceCount ?? 0,
            monthCount,
            totalStudents,
            records,
        });
    }
    catch (error) {
        next(error);
    }
});
attendanceRouter.get('/:date', async (req, res, next) => {
    try {
        const { date } = req.params;
        const result = await pool.query(`
      SELECT s.id AS "studentId", s.name AS "studentName",
             COALESCE(a.status, 'Absent') AS status
      FROM students s
      LEFT JOIN attendance a
        ON a.student_id = s.id
       AND a.attendance_date = $1::date
      ORDER BY s.id ASC
      `, [date]);
        res.json({ date: normalizeDate(date), entries: result.rows });
    }
    catch (error) {
        next(error);
    }
});
attendanceRouter.put('/:date', async (req, res, next) => {
    const client = await pool.connect();
    try {
        const { date } = req.params;
        const payload = saveAttendanceSchema.parse(req.body);
        await client.query('BEGIN');
        await client.query('DELETE FROM attendance WHERE attendance_date = $1::date', [date]);
        for (const entry of payload.entries) {
            await client.query(`INSERT INTO attendance (attendance_date, student_id, status)
         VALUES ($1::date, $2, $3)`, [date, entry.studentId, entry.status]);
        }
        await client.query('COMMIT');
        res.json({ ok: true });
    }
    catch (error) {
        await client.query('ROLLBACK');
        next(error);
    }
    finally {
        client.release();
    }
});
