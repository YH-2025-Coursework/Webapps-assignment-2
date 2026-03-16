const express = require("express");
const router = express.Router();
const incidentService = require("../services/incidentService");
const noteService = require("../services/noteService");

router.get("/", (req, res) => {
  res.json(incidentService.getAll());
});

router.get("/:id", (req, res) => {
  const incident = incidentService.getById(req.params.id);
  if (!incident) return res.sendStatus(404);
  res.json(incident);
});

router.post("/", (req, res) => {
  const { name, impact, affectedServiceIds } = req.body;
  if (!name || !impact) return res.status(400).json({ error: "name and impact are required" });

  const incident = incidentService.create({ name, impact, affectedServiceIds });
  res.status(201).json(incident);
});

router.put("/:id", (req, res) => {
  const updated = incidentService.update(req.params.id, req.body);
  if (!updated) return res.sendStatus(404);
  res.json(updated);
});

router.post("/:id/updates", (req, res) => {
  const { status, body } = req.body;
  if (!status || !body) return res.status(400).json({ error: "status and body are required" });

  const update = incidentService.addUpdate(req.params.id, { status, body });
  if (!update) return res.sendStatus(404);
  res.status(201).json(update);
});

router.get("/:id/notes", (req, res) => {
  const notes = noteService.getAllByIncident(req.params.id);
  if (!notes) return res.sendStatus(404);
  res.json(notes);
});

router.post("/:id/notes", (req, res) => {
  const { body } = req.body;
  if (!body) return res.status(400).json({ error: "body is required" });

  const note = noteService.create(req.params.id, { body });
  if (!note) return res.sendStatus(404);
  res.status(201).json(note);
});

router.put("/:id/notes/:noteId", (req, res) => {
  const { body } = req.body;
  if (!body) return res.status(400).json({ error: "body is required" });

  const note = noteService.update(req.params.id, req.params.noteId, { body });
  if (!note) return res.sendStatus(404);
  res.json(note);
});

router.delete("/:id/notes/:noteId", (req, res) => {
  const deleted = noteService.remove(req.params.id, req.params.noteId);
  if (!deleted) return res.sendStatus(404);
  res.sendStatus(204);
});

module.exports = router;
