function formatStatus(status) {
  return status.replace(/_/g, " ");
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateTime(date) {
  return date.toLocaleString("en-GB", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function renderError(container, message) {
  container.innerHTML = `<p class="error">⚠ ${message}</p>`;
}

export function renderStatusGrid(container, enrichedServices) {
  container.innerHTML = enrichedServices
    .map((s) => {
      const open = s.incidents.filter((i) => i.status !== "resolved").length;
      return `
        <div class="service-card status-${s.status}">
          <div class="service-card-dot"></div>
          <div>
            <span class="service-card-name">${s.name}</span>
            <span class="service-card-status">${formatStatus(s.status)}</span>
            ${open > 0 ? `<span class="service-card-incidents">${open} active incident${open > 1 ? "s" : ""}</span>` : ""}
          </div>
        </div>
      `;
    })
    .join("");
}

export function renderTimeline(container, incidents, services, range) {
  const rangeMs = range.max.getTime() - range.min.getTime();

  const labels = [0, 0.25, 0.5, 0.75, 1]
    .map((t) => {
      const date = new Date(range.min.getTime() + rangeMs * t);
      return `<span class="time-label" style="left:${t * 100}%">${formatDate(date)}</span>`;
    })
    .join("");

  const rows = services
    .map((service) => {
      const bars = incidents
        .filter((i) => i.affectedServiceIds.includes(service.id))
        .map((incident) => {
          const start = new Date(incident.startedAt).getTime();
          const end = incident.resolvedAt
            ? new Date(incident.resolvedAt).getTime()
            : Date.now();
          const left = ((start - range.min.getTime()) / rangeMs) * 100;
          const width = Math.max(((end - start) / rangeMs) * 100, 0.3);
          return `<div class="timeline-bar impact-${incident.impact}"
                       style="left:${left}%;width:${width}%"
                       title="${incident.name}"></div>`;
        })
        .join("");

      return `
        <div class="timeline-row">
          <span class="timeline-label" title="${service.name}">${service.name}</span>
          <div class="timeline-track">${bars}</div>
        </div>
      `;
    })
    .join("");

  container.innerHTML = `
    <div class="timeline-axis">${labels}</div>
    <div class="timeline-rows">${rows}</div>
  `;
}

export function renderServicesPanel(container, services) {
  if (!services) {
    container.innerHTML = '<p class="error">⚠ Services unavailable</p>';
    return;
  }
  container.innerHTML = services
    .map(
      (s) => `
      <div class="panel-item">
        <span class="status-dot status-${s.status}"></span>
        <div>
          <div class="panel-item-name">${s.name}</div>
          <div class="panel-item-meta">${formatStatus(s.status)}</div>
          ${s.description ? `<div class="panel-item-meta">${s.description}</div>` : ""}
        </div>
      </div>
    `
    )
    .join("");
}

export function renderIncidentsList(container, incidents, services, onSelect) {
  if (!incidents) {
    container.innerHTML = '<p class="error">⚠ Incidents unavailable</p>';
    return;
  }
  if (!incidents.length) {
    container.innerHTML = '<p class="muted">No incidents</p>';
    return;
  }
  container.innerHTML = incidents
    .map((i) => {
      const affected = i.affectedServiceIds
        .map((id) => services?.find((s) => s.id === id)?.name ?? `#${id}`)
        .join(", ");
      return `
        <div class="panel-item panel-item-clickable" data-id="${i.id}">
          <span class="status-dot impact-${i.impact}"></span>
          <div>
            <div class="panel-item-name">${i.name}</div>
            <div class="panel-item-meta">${formatDate(new Date(i.startedAt))} · ${i.status}</div>
            <div class="panel-item-meta">${affected}</div>
          </div>
        </div>
      `;
    })
    .join("");

  container.querySelectorAll(".panel-item-clickable").forEach((el) => {
    el.addEventListener("click", () => onSelect(el.dataset.id));
  });
}

export function renderIncidentDetail(container, incident, notes, callbacks) {
  const { onBack, onAddUpdate, onAddNote, onEditNote, onDeleteNote } = callbacks;

  const updatesHtml = incident.updates.length
    ? incident.updates
        .map(
          (u) => `
          <div class="update-item">
            <div class="update-header">
              <span class="badge status-${u.status}">${u.status}</span>
              <span class="update-time">${formatDateTime(new Date(u.createdAt))}</span>
            </div>
            <div class="update-body">${u.body}</div>
          </div>
        `
        )
        .join("")
    : '<p class="muted">No updates yet</p>';

  container.innerHTML = `
    <button class="detail-back">← Back to incidents</button>
    <div class="detail-title">
      ${incident.name}
      <span class="badge impact-${incident.impact}">${incident.impact}</span>
      <span class="badge status-${incident.status}">${incident.status}</span>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Updates</div>
      <div class="updates-list">${updatesHtml}</div>
      <form class="form-add" id="update-form">
        <select name="status">
          <option value="investigating">Investigating</option>
          <option value="identified">Identified</option>
          <option value="monitoring">Monitoring</option>
          <option value="resolved">Resolved</option>
        </select>
        <textarea name="body" placeholder="Update message…" required></textarea>
        <button type="submit">Add Update</button>
      </form>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Internal Notes</div>
      <div id="notes-list">${renderNotesList(notes)}</div>
      <form class="form-add" id="note-form">
        <textarea name="body" placeholder="Add a note…" required></textarea>
        <button type="submit">Add Note</button>
      </form>
    </div>
  `;

  container.querySelector(".detail-back").addEventListener("click", onBack);

  container.querySelector("#update-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    await onAddUpdate({ status: form.status.value, body: form.body.value.trim() });
  });

  container.querySelector("#note-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = e.target.body.value.trim();
    if (!body) return;
    const note = await onAddNote(body);
    const notesList = container.querySelector("#notes-list");
    const placeholder = notesList.querySelector(".muted");
    if (placeholder) placeholder.remove();
    notesList.insertAdjacentHTML("afterbegin", renderNoteItem(note));
    e.target.reset();
  });

  attachNoteHandlers(container.querySelector("#notes-list"), onEditNote, onDeleteNote);
}

function renderNotesList(notes) {
  if (!notes.length) return '<p class="muted">No notes yet</p>';
  return notes.map(renderNoteItem).join("");
}

function renderNoteItem(note) {
  return `
    <div class="note-item" data-id="${note.id}">
      <div class="note-body">${note.body}</div>
      <div class="note-footer">
        <span class="note-meta">${formatDateTime(new Date(note.updatedAt))}</span>
        <div class="note-actions">
          <button class="btn-edit-note">Edit</button>
          <button class="btn-delete-note">Delete</button>
        </div>
      </div>
    </div>
  `;
}

function attachNoteHandlers(container, onEditNote, onDeleteNote) {
  container.addEventListener("click", async (e) => {
    const noteItem = e.target.closest(".note-item");
    if (!noteItem) return;
    const noteId = noteItem.dataset.id;

    if (e.target.matches(".btn-delete-note")) {
      await onDeleteNote(noteId);
      noteItem.remove();
    } else if (e.target.matches(".btn-edit-note")) {
      const bodyEl = noteItem.querySelector(".note-body");
      bodyEl.innerHTML = `<textarea class="edit-textarea" rows="2">${bodyEl.textContent}</textarea>`;
      e.target.textContent = "Save";
      e.target.className = "btn-save-note";
    } else if (e.target.matches(".btn-save-note")) {
      const newBody = noteItem.querySelector(".edit-textarea").value.trim();
      if (!newBody) return;
      const updated = await onEditNote(noteId, newBody);
      noteItem.querySelector(".note-body").textContent = updated.body;
      noteItem.querySelector(".note-meta").textContent = formatDateTime(
        new Date(updated.updatedAt)
      );
      e.target.textContent = "Edit";
      e.target.className = "btn-edit-note";
    }
  });
}
