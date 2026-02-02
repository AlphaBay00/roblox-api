const express = require("express");
const { Pool } = require("pg");

const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query(`
CREATE TABLE IF NOT EXISTS active_users (
  player_id TEXT PRIMARY KEY,
  last_seen BIGINT
)
`);

app.get("/join", async (req, res) => {
  const id = req.query.player;
  const now = Date.now();

  await pool.query(
    "INSERT INTO active_users VALUES($1,$2) ON CONFLICT (player_id) DO UPDATE SET last_seen=$2",
    [id, now]
  );

  res.send("joined");
});

app.get("/heartbeat", async (req, res) => {
  const id = req.query.player;
  const now = Date.now();

  await pool.query(
    "UPDATE active_users SET last_seen=$1 WHERE player_id=$2",
    [now, id]
  );

  res.send("alive");
});

app.get("/count", async (req, res) => {
  const limit = Date.now() - 120000;

  const r = await pool.query(
    "SELECT COUNT(*) FROM active_users WHERE last_seen > $1",
    [limit]
  );

  res.json({ online: r.rows[0].count });
});

app.listen(3000, () => console.log("Running"));
