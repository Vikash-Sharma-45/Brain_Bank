import { Router } from 'express';
import * as noteCtrl from '../controllers/noteController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import upload from '../middleware/upload.js';
import {
  noteQuerySchema,
  noteIdSchema,
  searchQuerySchema,
  createNoteSchema,
  updateNoteSchema,
  reorderSchema,
} from '../validators/note.js';

const router = Router();

// All note routes require authentication
router.use(authenticate);

// Search must come before /:id to avoid treating "search" as an id
router.get('/search', validate(searchQuerySchema, 'query'), noteCtrl.search);

router.get('/', validate(noteQuerySchema, 'query'), noteCtrl.list);
router.get('/:id', validate(noteIdSchema, 'params'), noteCtrl.getOne);

// Admin-only write operations
router.post(
  '/',
  requireAdmin,
  upload.single('file'),
  validate(createNoteSchema),
  noteCtrl.create
);

router.put(
  '/:id',
  requireAdmin,
  upload.single('file'),
  validate(noteIdSchema, 'params'),
  validate(updateNoteSchema),
  noteCtrl.update
);

router.delete(
  '/:id',
  requireAdmin,
  validate(noteIdSchema, 'params'),
  noteCtrl.remove
);

router.patch(
  '/reorder',
  requireAdmin,
  validate(reorderSchema),
  noteCtrl.reorder
);

export default router;
