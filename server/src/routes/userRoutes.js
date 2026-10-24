import { Router } from 'express';
import * as userCtrl from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import {
  noteIdParamSchema,
  updateStatusSchema,
  updatePositionSchema,
} from '../validators/user.js';

const router = Router();

// All user study data routes require authentication
router.use(authenticate);

// Bookmarks
router.post(
  '/bookmarks/:noteId',
  validate(noteIdParamSchema, 'params'),
  userCtrl.addBookmark
);
router.delete(
  '/bookmarks/:noteId',
  validate(noteIdParamSchema, 'params'),
  userCtrl.removeBookmark
);
router.get('/bookmarks', userCtrl.getBookmarks);

// Note status & reading position
router.patch(
  '/notes/:noteId/status',
  validate(noteIdParamSchema, 'params'),
  validate(updateStatusSchema),
  userCtrl.updateStatus
);
router.put(
  '/notes/:noteId/position',
  validate(noteIdParamSchema, 'params'),
  validate(updatePositionSchema),
  userCtrl.updatePosition
);

// Study progress & recently viewed
router.get('/recent', userCtrl.getRecent);
router.get('/progress', userCtrl.getProgress);

export default router;
