import { Note, Subject } from '../models/index.js';
import AppError from '../utils/AppError.js';

export const getAllSubjects = async () => {
  return Subject.find().sort({ order: 1, name: 1 });
};

export const getSubjectById = async (id) => {
  const subject = await Subject.findById(id);
  if (!subject) throw new AppError('Subject not found', 404);
  return subject;
};

export const createSubject = async (data) => {
  return Subject.create(data);
};

export const updateSubject = async (id, data) => {
  const subject = await Subject.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!subject) throw new AppError('Subject not found', 404);
  return subject;
};

export const deleteSubject = async (id) => {
  const subject = await Subject.findById(id);
  if (!subject) throw new AppError('Subject not found', 404);

  const hasNotes = await Note.exists({ subject: id });
  if (hasNotes) {
    throw new AppError('Cannot delete a subject that still has notes', 409);
  }

  await subject.deleteOne();
  return subject;
};
