import { User, Note, Subject } from '../models/index.js';
import AppError from '../utils/AppError.js';

/**
 * Add a note to the user's bookmarks
 */
export const addBookmark = async (userId, noteId) => {
  const note = await Note.findById(noteId);
  if (!note) throw new AppError('Note not found', 404);

  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { bookmarks: noteId } },
    { new: true }
  ).select('bookmarks');

  return user.bookmarks;
};

/**
 * Remove a note from the user's bookmarks
 */
export const removeBookmark = async (userId, noteId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { bookmarks: noteId } },
    { new: true }
  ).select('bookmarks');

  return user.bookmarks;
};

/**
 * Get all bookmarked notes for a user
 */
export const getBookmarks = async (userId) => {
  const user = await User.findById(userId)
    .populate({
      path: 'bookmarks',
      populate: { path: 'subject', select: 'name slug' },
    })
    .lean();

  return user?.bookmarks || [];
};

/**
 * Update reading status for a note (not_started | reading | revised)
 */
export const updateNoteStatus = async (userId, noteId, status) => {
  const note = await Note.findById(noteId);
  if (!note) throw new AppError('Note not found', 404);

  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  const existingIndex = user.noteStatus.findIndex(
    (item) => item.note.toString() === noteId.toString()
  );

  if (existingIndex > -1) {
    user.noteStatus[existingIndex].status = status;
    user.noteStatus[existingIndex].updatedAt = new Date();
  } else {
    user.noteStatus.push({
      note: noteId,
      status,
      updatedAt: new Date(),
    });
  }

  await user.save();
  return user.noteStatus;
};

/**
 * Update reading position and record note in recentlyViewed
 */
export const updateNotePosition = async (userId, noteId, position) => {
  const note = await Note.findById(noteId);
  if (!note) throw new AppError('Note not found', 404);

  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  // Update or insert recentlyViewed
  const recentIndex = user.recentlyViewed.findIndex(
    (item) => item.note.toString() === noteId.toString()
  );

  if (recentIndex > -1) {
    user.recentlyViewed[recentIndex].position = position;
    user.recentlyViewed[recentIndex].viewedAt = new Date();
  } else {
    user.recentlyViewed.push({
      note: noteId,
      position,
      viewedAt: new Date(),
    });
  }

  // Sort recentlyViewed descending by viewedAt and limit to 20
  user.recentlyViewed.sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt));
  if (user.recentlyViewed.length > 20) {
    user.recentlyViewed = user.recentlyViewed.slice(0, 20);
  }

  // If status is not yet set or not_started, automatically mark as reading
  const statusIndex = user.noteStatus.findIndex(
    (item) => item.note.toString() === noteId.toString()
  );

  if (statusIndex === -1) {
    user.noteStatus.push({
      note: noteId,
      status: 'reading',
      updatedAt: new Date(),
    });
  } else if (user.noteStatus[statusIndex].status === 'not_started') {
    user.noteStatus[statusIndex].status = 'reading';
    user.noteStatus[statusIndex].updatedAt = new Date();
  }

  await user.save();
  return { position, recentlyViewed: user.recentlyViewed };
};

/**
 * Get recently viewed notes with populated subject and note details
 */
export const getRecent = async (userId) => {
  const user = await User.findById(userId)
    .populate({
      path: 'recentlyViewed.note',
      populate: { path: 'subject', select: 'name slug' },
    })
    .lean();

  if (!user) throw new AppError('User not found', 404);

  // Filter out any deleted notes and return formatted recent list
  const recent = (user.recentlyViewed || [])
    .filter((item) => item.note !== null)
    .sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt));

  return recent;
};

/**
 * Calculate per-subject progress: revised vs total notes
 */
export const getProgress = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) throw new AppError('User not found', 404);

  const subjects = await Subject.find().sort({ order: 1, createdAt: 1 }).lean();

  // Create a map of noteId -> status
  const statusMap = new Map();
  (user.noteStatus || []).forEach((item) => {
    statusMap.set(item.note.toString(), item.status);
  });

  const progress = await Promise.all(
    subjects.map(async (subject) => {
      const notes = await Note.find({ subject: subject._id }).select('_id').lean();
      const totalNotes = notes.length;

      let revisedCount = 0;
      let readingCount = 0;

      notes.forEach((note) => {
        const st = statusMap.get(note._id.toString());
        if (st === 'revised') revisedCount++;
        else if (st === 'reading') readingCount++;
      });

      const percentage = totalNotes > 0 ? Math.round((revisedCount / totalNotes) * 100) : 0;

      return {
        subjectId: subject._id,
        name: subject.name,
        slug: subject.slug,
        totalNotes,
        revisedCount,
        readingCount,
        percentage,
      };
    })
  );

  return progress;
};
