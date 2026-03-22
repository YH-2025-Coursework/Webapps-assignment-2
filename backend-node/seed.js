const path = require("path");
const db = require("./src/db/database");

const { components } = require(path.join(__dirname, "../seed-data/components.json"));
const { incidents } = require(path.join(__dirname, "../seed-data/incidents.json"));

const existing = db.prepare("SELECT COUNT(*) as count FROM incidents").get();
if (existing.count > 0) {
  console.log("Already seeded, skipping.");
  process.exit(0);
}

// Build GitHub string ID → integer ID mapping.
// Showcase components are inserted in JSON order by the .NET seed, so they get IDs 1–10.
const idMap = {};
components
  .filter((c) => c.showcase)
  .forEach((c, i) => {
    idMap[c.id] = i + 1;
  });

const insertIncident = db.prepare(`
  INSERT INTO incidents (id, name, impact, status, started_at, resolved_at, affected_service_ids)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const insertUpdate = db.prepare(`
  INSERT INTO incident_updates (id, incident_id, status, body, created_at)
  VALUES (?, ?, ?, ?, ?)
`);

const seedAll = db.transaction(() => {
  for (const incident of incidents) {
    const affectedServiceIds = incident.components
      .map((c) => idMap[c.id])
      .filter(Boolean);

    insertIncident.run(
      incident.id,
      incident.name,
      incident.impact,
      incident.status,
      incident.started_at,
      incident.resolved_at ?? null,
      JSON.stringify(affectedServiceIds)
    );

    for (const update of incident.incident_updates) {
      insertUpdate.run(update.id, incident.id, update.status, update.body, update.created_at);
    }
  }
});

seedAll();
console.log(`Seeded ${incidents.length} incidents.`);
