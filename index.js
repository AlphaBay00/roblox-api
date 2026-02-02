const { v4: uuidv4 } = require("uuid"); // تحتاج تثبيت مكتبة uuid

app.get("/join", async (req, res) => {
  const playerId = req.query.player;
  const sessionId = uuidv4();
  const now = Date.now();

  await pool.query(
    "INSERT INTO active_sessions(session_id, player_id, last_seen) VALUES($1,$2,$3)",
    [sessionId, playerId, now]
  );

  res.json({ sessionId });
});

app.get("/heartbeat", async (req, res) => {
  const sessionId = req.query.session;
  const now = Date.now();

  await pool.query(
    "UPDATE active_sessions SET last_seen=$1 WHERE session_id=$2",
    [now, sessionId]
  );

  res.send("alive");
});

app.get("/count", async (req, res) => {
  const limit = Date.now() - 2000; // لو تبي heartbeat كل ثانية، خلي 2 ثانية
  const r = await pool.query(
    "SELECT COUNT(*) FROM active_sessions WHERE last_seen > $1",
    [limit]
  );

  res.json({ online: r.rows[0].count });
});
