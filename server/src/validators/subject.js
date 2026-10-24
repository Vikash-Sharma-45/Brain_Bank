import { z } from 'zod';

export const createSubjectSchema = z.object({
  name: z
    .string({ required_error: 'Subject name is required' })
    .trim()
    .min(1, 'Subject name is required')
    .max(120),
  slug: z
    .string({ required_error: 'Slug is required' })
    .trim()
    .toLowerCase()
    .min(1, 'Slug is required')
    .max(120)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase alphanumeric with hyphens'
    ),
  description: z.string().trim().max(500).optional().default(''),
  order: z.coerce.number().int().min(0).optional().default(0),
});

export const updateSubjectSchema = createSubjectSchema.partial();

export const subjectIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid subject ID'),
});
