const db = require("../db/database");

function getAllByIncident(incidentId) {
  const incident = db.prepare("SELECT id FROM incidents WHERE id = ?").get(incidentId);
  if (!incident) return null;

  return db
    .prepare("SELECT * FROM internal_notes WHERE incident_id = ? ORDER BY created_at DESC")
    .all(incidentId)
    .map(parseNote);
}

function create(incidentId, data) {
  const incident = db.prepare("SELECT id FROM incidents WHERE id = ?").get(incidentId);
  if (!incident) return null;

  const now = new Date().toISOString();

  const result = db.prepare(`
    INSERT INTO internal_notes (incident_id, body, created_at, updated_at)
    VALUES (?, ?, ?, ?)
  `).run(incidentId, data.body, now, now);

  return db.prepare("SELECT * FROM internal_notes WHERE id = ?").get(result.lastInsertRowid);
}

function update(incidentId, noteId, data) {
  const note = db
    .prepare("SELECT * FROM internal_notes WHERE id = ? AND incident_id = ?")
    .get(noteId, incidentId);
  if (!note) return null;

  const now = new Date().toISOString();

  db.prepare("UPDATE internal_notes SET body = ?, updated_at = ? WHERE id = ?")
    .run(data.body, now, noteId);

  return db.prepare("SELECT * FROM internal_notes WHERE id = ?").get(noteId);
}

function remove(incidentId, noteId) {
  const note = db
    .prepare("SELECT id FROM internal_notes WHERE id = ? AND incident_id = ?")
    .get(noteId, incidentId);
  if (!note) return false;

  db.prepare("DELETE FROM internal_notes WHERE id = ?").run(noteId);
  return true;
}

function parseNote(row) {
  return {
    id: row.id,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = { getAllByIncident, create, update, remove };
