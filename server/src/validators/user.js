import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const noteIdParamSchema = z.object({
  noteId: z.string().regex(objectIdRegex, 'Invalid Note ID format'),
});

export const updateStatusSchema = z.object({
  status: z.enum(['not_started', 'reading', 'revised'], {
    required_error: 'Status is required',
    invalid_type_error: 'Status must be one of: not_started, reading, revised',
  }),
});

export const updatePositionSchema = z.object({
  position: z.number().min(0, 'Position must be a positive number'),
});
