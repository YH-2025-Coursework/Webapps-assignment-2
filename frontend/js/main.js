import * as api from "./api.js";
import { enrichServices, timelineRange } from "./data.js";
import {
  renderError,
  renderStatusGrid,
  renderTimeline,
  renderServicesPanel,
  renderIncidentsList,
  renderIncidentDetail,
} from "./dom.js";

const statusGrid = document.getElementById("status-grid");
const timelineEl = document.getElementById("timeline");
const servicesList = document.getElementById("services-list");
const incidentsList = document.getElementById("incidents-list");
const incidentDetail = document.getElementById("incident-detail");
const servicesPanel = document.getElementById("services-panel");
const incidentsPanel = document.getElementById("incidents-panel");
const overlay = document.getElementById("overlay");

// ── Panels ──

function openPanel(panel) {
  panel.classList.add("open");
  overlay.classList.add("active");
}

function closePanel(panel) {
  panel.classList.remove("open");
  if (!document.querySelector(".panel.open")) {
    overlay.classList.remove("active");
  }
}

document
  .getElementById("toggle-services")
  .addEventListener("click", () => openPanel(servicesPanel));

document
  .getElementById("toggle-incidents")
  .addEventListener("click", () => openPanel(incidentsPanel));

overlay.addEventListener("click", () => {
  document.querySelectorAll(".panel.open").forEach(closePanel);
});

document.querySelectorAll(".panel-close").forEach((btn) => {
  btn.addEventListener("click", () => closePanel(btn.closest(".panel")));
});

// ── Incident detail ──

async function showIncidentDetail(id) {
  incidentsList.hidden = true;
  incidentDetail.hidden = false;
  incidentDetail.innerHTML = '<p class="loading">Loading…</p>';

  try {
    const [incident, notes] = await Promise.all([
      api.fetchIncident(id),
      api.fetchNotes(id),
    ]);

    renderIncidentDetail(incidentDetail, incident, notes, {
      onBack() {
        incidentDetail.hidden = true;
        incidentsList.hidden = false;
      },
      async onAddUpdate(data) {
        await api.appendUpdate(id, data);
        showIncidentDetail(id);
      },
      onAddNote: (body) => api.createNote(id, body),
      onEditNote: (noteId, body) => api.updateNote(id, noteId, body),
      onDeleteNote: (noteId) => api.deleteNote(id, noteId),
    });
  } catch (err) {
    incidentDetail.innerHTML = `<p class="error">⚠ ${err.message}</p>`;
  }
}

// ── Init ──

async function init() {
  const [servicesResult, incidentsResult] = await Promise.allSettled([
    api.fetchServices(),
    api.fetchIncidents(),
  ]);

  const services =
    servicesResult.status === "fulfilled" ? servicesResult.value : null;
  const incidents =
    incidentsResult.status === "fulfilled" ? incidentsResult.value : null;

  if (services && incidents) {
    const enriched = enrichServices(services, incidents);
    renderStatusGrid(statusGrid, enriched);
    renderTimeline(timelineEl, incidents, services, timelineRange(incidents));
  } else {
    if (!services) renderError(statusGrid, "Services API unavailable");
    if (!incidents) renderError(timelineEl, "Incidents API unavailable");
  }

  renderServicesPanel(servicesList, services);
  renderIncidentsList(incidentsList, incidents, services, showIncidentDetail);
}

init();
