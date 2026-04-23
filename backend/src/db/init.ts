import { hashPassword } from '../auth/password.js'
import { pool } from './pool.js'

const seedStudents = [
  ['Aarav Sharma', 10, 'Yellow', 'Rohit Sharma', 'Neha Sharma', '12 Green Park, East Street', '9876543210'],
  ['Diya Nair', 12, 'Green', 'Arun Nair', 'Meera Nair', '22 Lake View, Main Road', '9898981234'],
  ['Kiran Reddy', 15, 'Blue', 'Ramesh Reddy', 'Suma Reddy', '7 Lotus Colony, Sector 4', '9988776655'],
  ['Ananya Iyer', 9, 'White', 'Vijay Iyer', 'Lakshmi Iyer', '88 Temple Street, South Block', '9876501234'],
  ['Rahul Singh', 14, 'Red', 'Manoj Singh', 'Pooja Singh', '3 Park Avenue, West End', '9000012345'],
] as const

const seedMembers = [
  {
    email: 'admin@sia.academy',
    displayName: 'Academy Admin',
    phone: '9000000001',
    role: 'Admin',
    isActive: true,
  },
  {
    email: 'coach@sia.academy',
    displayName: 'Head Coach',
    phone: '9000000002',
    role: 'Instructor',
    isActive: true,
  },
  {
    email: 'member@sia.academy',
    displayName: 'Demo Member',
    phone: '9000000003',
    role: 'Member',
    isActive: true,
  },
  {
    email: 'inactive@sia.academy',
    displayName: 'Former Member',
    phone: null,
    role: 'Member',
    isActive: false,
  },
] as const

const seedEvents = [
  ['Spring open day', 'SIA Academy Main Dojang', '2026-05-10', '09:30', 'Tour the dojang, meet instructors, and attend a beginner-friendly Taekwondo session.'],
  ['Colour belt grading', 'SIA Academy Hall A', '2026-05-24', '10:00', 'Quarterly grading for eligible students. Please arrive 30 minutes early for check-in.'],
  ['Poomsae workshop', 'City Sports Complex', '2026-06-07', '08:00', 'Half-day technical workshop focused on poomsae rhythm, precision, and presentation.'],
] as const

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER NOT NULL CHECK (age > 0),
      belt TEXT NOT NULL,
      father_name TEXT NOT NULL,
      mother_name TEXT NOT NULL,
      address TEXT NOT NULL,
      primary_contact_number TEXT NOT NULL
    );
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES students(id) ON DELETE SET NULL,
      payment_mode TEXT NOT NULL,
      amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
      payment_date DATE NOT NULL,
      receipt TEXT NOT NULL
    );
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      event_name TEXT NOT NULL,
      place TEXT NOT NULL,
      date DATE NOT NULL,
      time TEXT NOT NULL,
      description TEXT NOT NULL
    );
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS attendance (
      id SERIAL PRIMARY KEY,
      attendance_date DATE NOT NULL,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      status TEXT NOT NULL CHECK (status IN ('Present', 'Absent')),
      UNIQUE(attendance_date, student_id)
    );
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS members (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL CHECK (role IN ('Admin', 'Instructor', 'Member')),
      is_active BOOLEAN NOT NULL DEFAULT true,
      password_hash TEXT NOT NULL
    );
  `)

  const memberCount = await pool.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM members')
  if (Number(memberCount.rows[0]?.count ?? 0) === 0) {
    const demoPasswordHash = hashPassword('demo123')
    for (const m of seedMembers) {
      await pool.query(
        `INSERT INTO members (email, display_name, phone, role, is_active, password_hash)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [m.email, m.displayName, m.phone, m.role, m.isActive, demoPasswordHash],
      )
    }
  }

  const studentCount = await pool.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM students')
  if (Number(studentCount.rows[0]?.count ?? 0) === 0) {
    for (const student of seedStudents) {
      await pool.query(
        `INSERT INTO students
          (name, age, belt, father_name, mother_name, address, primary_contact_number)
          VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        student as unknown as unknown[],
      )
    }
  }

  const eventsCount = await pool.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM events')
  if (Number(eventsCount.rows[0]?.count ?? 0) === 0) {
    for (const event of seedEvents) {
      await pool.query(
        `INSERT INTO events (event_name, place, date, time, description) VALUES ($1,$2,$3,$4,$5)`,
        event as unknown as unknown[],
      )
    }
  }
}
