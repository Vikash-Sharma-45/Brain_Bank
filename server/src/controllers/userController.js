import asyncHandler from '../utils/asyncHandler.js';
import * as userService from '../services/userService.js';

export const addBookmark = asyncHandler(async (req, res) => {
  const bookmarks = await userService.addBookmark(req.user._id, req.params.noteId);
  res.json({ success: true, data: { bookmarks } });
});

export const removeBookmark = asyncHandler(async (req, res) => {
  const bookmarks = await userService.removeBookmark(req.user._id, req.params.noteId);
  res.json({ success: true, data: { bookmarks } });
});

export const getBookmarks = asyncHandler(async (req, res) => {
  const bookmarks = await userService.getBookmarks(req.user._id);
  res.json({ success: true, data: { bookmarks } });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const noteStatus = await userService.updateNoteStatus(
    req.user._id,
    req.params.noteId,
    req.body.status
  );
  res.json({ success: true, data: { noteStatus } });
});

export const updatePosition = asyncHandler(async (req, res) => {
  const data = await userService.updateNotePosition(
    req.user._id,
    req.params.noteId,
    req.body.position
  );
  res.json({ success: true, data });
});

export const getRecent = asyncHandler(async (req, res) => {
  const recent = await userService.getRecent(req.user._id);
  res.json({ success: true, data: { recent } });
});

export const getProgress = asyncHandler(async (req, res) => {
  const progress = await userService.getProgress(req.user._id);
  res.json({ success: true, data: { progress } });
});
