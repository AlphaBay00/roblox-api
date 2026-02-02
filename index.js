const express = require("express");
const { Pool } = require("pg");
const { randomUUID } = require("crypto");

const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// جدول الجلسات
pool.query(`
CREATE TABLE IF NOT EXISTS active_sessions (
  session_id TEXT PRIMARY KEY,
  player_id TEXT,
  last_seen BIGINT
)
`);


// JOIN
app.get("/join", async (req, res) => {
  const playerId = req.query.player;
  const sessionId = randomUUID();
  const now = Date.now();

  // حذف أي جلسة قديمة لنفس اللاعب
  await pool.query(
    "DELETE FROM active_sessions WHERE player_id=$1",
    [playerId]
  );

  // إضافة جلسة جديدة
  await pool.query(
    "INSERT INTO active_sessions VALUES($1,$2,$3)",
    [sessionId, playerId, now]
  );

  res.json({ session: sessionId });
});


// HEARTBEAT
app.get("/heartbeat", async (req, res) => {
  const sessionId = req.query.session;
  const now = Date.now();

  await pool.query(
    "UPDATE active_sessions SET last_seen=$1 WHERE session_id=$2",
    [now, sessionId]
  );

  res.send("alive");
});


// COUNT
app.get("/count", async (req, res) => {
  const limit = Date.now() - 3000;

  const r = await pool.query(
    "SELECT COUNT(*) FROM active_sessions WHERE last_seen > $1",
    [limit]
  );

  res.json({ online: r.rows[0].count });
});

app.listen(3000, () => console.log("Running"));  );

  res.json({ session: sessionId });
});

// heartbeat
app.get("/heartbeat", async (req, res) => {
  const session = req.query.session;
  const now = Date.now();

  await pool.query(
    "UPDATE active_sessions SET last_seen=$1 WHERE session_id=$2",
    [now, session]
  );

  res.send("alive");
});

// عدّ الأونلاين
app.get("/count", async (req, res) => {
  const limit = Date.now() - 3000; // 3 ثواني

  const r = await pool.query(
    "SELECT COUNT(*) FROM active_sessions WHERE last_seen > $1",
    [limit]
  );

  res.json({ online: r.rows[0].count });
});

// تشغيل السيرفر
app.listen(3000, () => console.log("API Running"));
