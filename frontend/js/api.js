const SERVICES_URL = "https://localhost:7129";
const INCIDENTS_URL = "http://localhost:3000";

export async function fetchServices() {
  const res = await fetch(`${SERVICES_URL}/services`);
  if (!res.ok) throw new Error(`Services API: ${res.status}`);
  return res.json();
}

export async function fetchIncidents() {
  const res = await fetch(`${INCIDENTS_URL}/incidents`);
  if (!res.ok) throw new Error(`Incidents API: ${res.status}`);
  return res.json();
}

export async function fetchIncident(id) {
  const res = await fetch(`${INCIDENTS_URL}/incidents/${id}`);
  if (!res.ok) throw new Error(`Incidents API: ${res.status}`);
  return res.json();
}

export async function appendUpdate(incidentId, data) {
  const res = await fetch(`${INCIDENTS_URL}/incidents/${incidentId}/updates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Incidents API: ${res.status}`);
  return res.json();
}

export async function fetchNotes(incidentId) {
  const res = await fetch(`${INCIDENTS_URL}/incidents/${incidentId}/notes`);
  if (!res.ok) throw new Error(`Incidents API: ${res.status}`);
  return res.json();
}

export async function createNote(incidentId, body) {
  const res = await fetch(`${INCIDENTS_URL}/incidents/${incidentId}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
  if (!res.ok) throw new Error(`Incidents API: ${res.status}`);
  return res.json();
}

export async function updateNote(incidentId, noteId, body) {
  const res = await fetch(`${INCIDENTS_URL}/incidents/${incidentId}/notes/${noteId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
  if (!res.ok) throw new Error(`Incidents API: ${res.status}`);
  return res.json();
}

export async function deleteNote(incidentId, noteId) {
  const res = await fetch(`${INCIDENTS_URL}/incidents/${incidentId}/notes/${noteId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Incidents API: ${res.status}`);
}
