import asyncHandler from '../utils/asyncHandler.js';
import * as subjectService from '../services/subjectService.js';

export const getAll = asyncHandler(async (_req, res) => {
  const subjects = await subjectService.getAllSubjects();
  res.json({ success: true, data: { subjects } });
});

export const getOne = asyncHandler(async (req, res) => {
  const subject = await subjectService.getSubjectById(req.params.id);
  res.json({ success: true, data: { subject } });
});

export const create = asyncHandler(async (req, res) => {
  const subject = await subjectService.createSubject(req.body);
  res.status(201).json({ success: true, data: { subject } });
});

export const update = asyncHandler(async (req, res) => {
  const subject = await subjectService.updateSubject(req.params.id, req.body);
  res.json({ success: true, data: { subject } });
});

export const remove = asyncHandler(async (req, res) => {
  await subjectService.deleteSubject(req.params.id);
  res.json({ success: true, message: 'Subject deleted' });
});
