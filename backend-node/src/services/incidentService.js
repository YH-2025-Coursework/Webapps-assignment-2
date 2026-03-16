const db = require("../db/database");
const { randomUUID } = require("crypto");

function getAll() {
  const incidents = db.prepare("SELECT * FROM incidents ORDER BY started_at DESC").all();
  return incidents.map(parseIncident);
}

function getById(id) {
  const incident = db.prepare("SELECT * FROM incidents WHERE id = ?").get(id);
  if (!incident) return null;

  const updates = db
    .prepare("SELECT * FROM incident_updates WHERE incident_id = ? ORDER BY created_at DESC")
    .all(id);

  return { ...parseIncident(incident), updates };
}

function create(data) {
  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO incidents (id, name, impact, status, started_at, affected_service_ids)
    VALUES (?, ?, ?, 'investigating', ?, ?)
  `).run(id, data.name, data.impact, now, JSON.stringify(data.affectedServiceIds ?? []));

  return getById(id);
}

function update(id, data) {
  const incident = db.prepare("SELECT * FROM incidents WHERE id = ?").get(id);
  if (!incident) return null;

  const name = data.name ?? incident.name;
  const impact = data.impact ?? incident.impact;
  const status = data.status ?? incident.status;
  const affectedServiceIds = data.affectedServiceIds
    ? JSON.stringify(data.affectedServiceIds)
    : incident.affected_service_ids;
  const resolvedAt =
    data.status === "resolved" && !incident.resolved_at
      ? new Date().toISOString()
      : incident.resolved_at;

  db.prepare(`
    UPDATE incidents SET name = ?, impact = ?, status = ?, affected_service_ids = ?, resolved_at = ?
    WHERE id = ?
  `).run(name, impact, status, affectedServiceIds, resolvedAt, id);

  return getById(id);
}

function addUpdate(incidentId, data) {
  const incident = db.prepare("SELECT id FROM incidents WHERE id = ?").get(incidentId);
  if (!incident) return null;

  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO incident_updates (id, incident_id, status, body, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, incidentId, data.status, data.body, now);

  return db.prepare("SELECT * FROM incident_updates WHERE id = ?").get(id);
}

function parseIncident(row) {
  return {
    id: row.id,
    name: row.name,
    impact: row.impact,
    status: row.status,
    startedAt: row.started_at,
    resolvedAt: row.resolved_at,
    affectedServiceIds: JSON.parse(row.affected_service_ids),
  };
}

module.exports = { getAll, getById, create, update, addUpdate };
