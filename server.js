import express from 'express';
import cors from 'cors';
import pg from 'pg';

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// เชื่อมต่อไปยัง PostgreSQL Database ใน Docker
const pool = new Pool({
  user: process.env.DB_USER || 'admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'university_maintenance',
  password: process.env.DB_PASSWORD || 'password123',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

// ตรวจสอบการเชื่อมต่อ Database
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ ไม่สามารถเชื่อมต่อกับ PostgreSQL ใน Docker ได้:', err.message);
    console.log('💡 ตรวจสอบว่าสั่งรัน "docker compose up -d" หรือยัง');
  } else {
    console.log('✅ เชื่อมต่อฐานข้อมูล PostgreSQL สำเร็จ!');
    release();
  }
});

// 1. ดึงรายการแจ้งซ่อมทั้งหมด (GET /api/tickets)
app.get('/api/tickets', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        issue, 
        description, 
        category, 
        location, 
        priority, 
        status, 
        contact_name AS "contactName", 
        contact_phone AS "contactPhone", 
        contact_email AS "contactEmail",
        assigned_to_name AS "assignedTo",
        to_char(created_at, 'YYYY-MM-DD') AS "submittedDate",
        created_at AS "createdAt"
      FROM tickets 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching tickets:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// 2. รับแจ้งซ่อมรายการใหม่ (POST /api/tickets)
app.post('/api/tickets', async (req, res) => {
  const { 
    id, 
    issue, 
    description, 
    category, 
    location, 
    priority, 
    status, 
    contactName, 
    contact_name,
    contactPhone, 
    contact_phone,
    contactEmail,
    contact_email,
    assignedTo 
  } = req.body;

  try {
    const query = `
      INSERT INTO tickets (
        id, issue, description, category, location, priority, status, 
        contact_name, contact_phone, contact_email, assigned_to_name
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING 
        id, issue, description, category, location, priority, status, 
        contact_name AS "contactName", 
        contact_phone AS "contactPhone", 
        contact_email AS "contactEmail",
        assigned_to_name AS "assignedTo",
        to_char(created_at, 'YYYY-MM-DD') AS "submittedDate";
    `;

    const values = [
      id,
      issue,
      description || '',
      category,
      location,
      priority || 'Medium',
      status || 'Pending',
      contactName || contact_name || '',
      contactPhone || contact_phone || '',
      contactEmail || contact_email || '',
      assignedTo || 'Unassigned'
    ];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error inserting ticket:', err);
    res.status(500).json({ error: 'Failed to insert ticket' });
  }
});

// 3. อัปเดตสถานะงานซ่อม (PATCH /api/tickets/:id)
app.patch('/api/tickets/:id', async (req, res) => {
  const { id } = req.params;
  const { status, assignedTo } = req.body;

  try {
    let query = 'UPDATE tickets SET status = COALESCE($1, status)';
    const values = [status];

    if (assignedTo !== undefined) {
      query += ', assigned_to_name = $2, updated_at = NOW() WHERE id = $3';
      values.push(assignedTo, id);
    } else {
      query += ', updated_at = NOW() WHERE id = $2';
      values.push(id);
    }

    query += ' RETURNING *;';

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating ticket:', err);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Maintenance API Server กำลังทำงานที่: http://localhost:${PORT}`);
});
