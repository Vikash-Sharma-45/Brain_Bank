import asyncHandler from '../utils/asyncHandler.js';
import * as noteService from '../services/noteService.js';

export const list = asyncHandler(async (req, res) => {
  const data = await noteService.listNotes(req.query);
  res.json({ success: true, data });
});

export const getOne = asyncHandler(async (req, res) => {
  const note = await noteService.getNoteById(req.params.id);
  res.json({ success: true, data: { note } });
});

export const create = asyncHandler(async (req, res) => {
  const note = await noteService.createNote(req.body, req.file, req.user._id);
  res.status(201).json({ success: true, data: { note } });
});

export const update = asyncHandler(async (req, res) => {
  const note = await noteService.updateNote(req.params.id, req.body, req.file);
  res.json({ success: true, data: { note } });
});

export const remove = asyncHandler(async (req, res) => {
  await noteService.deleteNote(req.params.id);
  res.json({ success: true, message: 'Note deleted' });
});

export const reorder = asyncHandler(async (req, res) => {
  await noteService.reorderNotes(req.body.items);
  res.json({ success: true, message: 'Notes reordered' });
});

export const search = asyncHandler(async (req, res) => {
  const data = await noteService.searchNotes(req.query);
  res.json({ success: true, data });
});
