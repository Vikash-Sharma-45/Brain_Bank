import { Router } from 'express';
import * as subjectCtrl from '../controllers/subjectController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import {
  createSubjectSchema,
  updateSubjectSchema,
  subjectIdSchema,
} from '../validators/subject.js';

const router = Router();

// All subject routes require authentication
router.use(authenticate);

router.get('/', subjectCtrl.getAll);
router.get('/:id', validate(subjectIdSchema, 'params'), subjectCtrl.getOne);

// Admin-only
router.post('/', requireAdmin, validate(createSubjectSchema), subjectCtrl.create);
router.put(
  '/:id',
  requireAdmin,
  validate(subjectIdSchema, 'params'),
  validate(updateSubjectSchema),
  subjectCtrl.update
);
router.delete(
  '/:id',
  requireAdmin,
  validate(subjectIdSchema, 'params'),
  subjectCtrl.remove
);

export default router;
