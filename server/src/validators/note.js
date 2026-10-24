import { z } from 'zod';

export const noteQuerySchema = z.object({
  subject: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  tag: z.string().optional(),
  type: z.enum(['markdown', 'pdf', 'docx']).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export const noteIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid note ID'),
});

export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required').max(200),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

// For the multipart form, body fields arrive as strings
export const createNoteSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(1, 'Title is required')
    .max(200),
  subject: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid subject ID'),
  chapter: z.string().trim().max(150).optional().default(''),
  tags: z
    .union([
      z.string().transform((s) => s.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)),
      z.array(z.string().trim().toLowerCase()),
    ])
    .optional()
    .default([]),
  order: z.coerce.number().int().min(0).optional().default(0),
  // For inline markdown (no file upload)
  content: z.string().optional().default(''),
});

export const updateNoteSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  subject: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  chapter: z.string().trim().max(150).optional(),
  tags: z
    .union([
      z.string().transform((s) => s.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)),
      z.array(z.string().trim().toLowerCase()),
    ])
    .optional(),
  order: z.coerce.number().int().min(0).optional(),
  content: z.string().optional(),
});

export const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().regex(/^[0-9a-fA-F]{24}$/),
      order: z.coerce.number().int().min(0),
    })
  ).min(1, 'At least one item is required'),
});
