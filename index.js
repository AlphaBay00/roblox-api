const express = require("express");
const { Pool } = require("pg");
const { randomUUID } = require("crypto");

const app = express();

// إعداد الاتصال بالداتابيس
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// دالة بدء السيرفر
const startServer = async () => {
  try {
    // إنشاء جدول الجلسات إذا ما كان موجود
    await pool.query(`
      CREATE TABLE IF NOT EXISTS active_sessions (
        session_id TEXT PRIMARY KEY,
        player_id TEXT,
        last_seen BIGINT
      )
    `);

    // تنظيف الجلسات الميتة كل ثانية
    setInterval(async () => {
      const limit = Date.now() - 2000; // أي جلسة بدون heartbeat آخر 2 ثانية تحذف
      await pool.query("DELETE FROM active_sessions WHERE last_seen < $1", [limit]);
    }, 1000);

    // دخول سكربت (جلسة جديدة)
    app.get("/join", async (req, res) => {
      const playerId = req.query.player;
      const sessionId = randomUUID();
      const now = Date.now();

      await pool.query("DELETE FROM active_sessions WHERE player_id=$1", [playerId]);
      await pool.query("INSERT INTO active_sessions VALUES($1,$2,$3)", [sessionId, playerId, now]);

      res.json({ session: sessionId });
    });

    // heartbeat
    app.get("/heartbeat", async (req, res) => {
      const sessionId = req.query.session;
      const now = Date.now();

      await pool.query("UPDATE active_sessions SET last_seen=$1 WHERE session_id=$2", [now, sessionId]);
      res.send("alive");
    });

    // عدّ الأونلاين
    app.get("/count", async (req, res) => {
      const limit = Date.now() - 2000;
      const r = await pool.query("SELECT COUNT(*) FROM active_sessions WHERE last_seen > $1", [limit]);
      res.json({ online: r.rows[0].count });
    });

    // ping endpoint لمنع النوم
    app.get("/ping", (req, res) => {
      res.send("pong");
    });

    // تشغيل السيرفر
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log("API Running on port", PORT));

  } catch (err) {
    console.error("Server start error:", err);
  }
};

// استدعاء الدالة
startServer();  await pool.query(
    "DELETE FROM active_sessions WHERE player_id=$1",
    [playerId]
  );

  await pool.query(
    "INSERT INTO active_sessions VALUES($1,$2,$3)",
    [sessionId, playerId, now]
  );

  res.json({ session: sessionId });
});

// heartbeat
app.get("/heartbeat", async (req, res) => {
  const sessionId = req.query.session;
  const now = Date.now();

  await pool.query(
    "UPDATE active_sessions SET last_seen=$1 WHERE session_id=$2",
    [now, sessionId]
  );

  res.send("alive");
});

// count
app.get("/count", async (req, res) => {
  const limit = Date.now() - 2000;

  const r = await pool.query(
    "SELECT COUNT(*) FROM active_sessions WHERE last_seen > $1",
    [limit]
  );

  res.json({ online: r.rows[0].count });
});

// ping
app.get("/ping", (req, res) => {
  res.send("pong");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API Running on", PORT));  await pool.query(
    "DELETE FROM active_sessions WHERE player_id=$1",
    [playerId]
  );

  await pool.query(
    "INSERT INTO active_sessions VALUES($1,$2,$3)",
    [sessionId, playerId, now]
  );

  res.json({ session: sessionId });
});

// heartbeat
app.get("/heartbeat", async (req, res) => {
  const sessionId = req.query.session;
  const now = Date.now();

  await pool.query(
    "UPDATE active_sessions SET last_seen=$1 WHERE session_id=$2",
    [now, sessionId]
  );

  res.send("alive");
});

// عدّ الأونلاين
app.get("/count", async (req, res) => {
  const limit = Date.now() - 2000;

  const r = await pool.query(
    "SELECT COUNT(*) FROM active_sessions WHERE last_seen > $1",
    [limit]
  );

  res.json({ online: r.rows[0].count });
});

// ping endpoint لمنع النوم
app.get("/ping", (req, res) => {
  res.send("pong");
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API Running"));
