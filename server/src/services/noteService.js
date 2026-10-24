import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import sanitizeHtml from 'sanitize-html';
import { Note, Subject } from '../models/index.js';
import * as storage from './storage.js';
import AppError from '../utils/AppError.js';

// ── Helpers ──────────────────────────────────

/**
 * Detect note type from the file extension.
 */
const detectType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const map = { '.md': 'markdown', '.pdf': 'pdf', '.docx': 'docx' };
  return map[ext] || null;
};

/**
 * Sanitize HTML produced by mammoth (docx → HTML).
 */
const cleanHtml = (html) =>
  sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'sup', 'sub', 'mark', 'details', 'summary',
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'title', 'width', 'height'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan'],
    },
  });

/**
 * Process an uploaded file and return the fields to store on the Note.
 */
const processFile = async (file) => {
  const type = detectType(file.originalname);
  if (!type) throw new AppError('Unsupported file type', 400);

  const result = {
    type,
    content: '',
    fileKey: '',
    originalFilename: file.originalname,
    fileSize: file.size,
    extractedText: '',
  };

  switch (type) {
    case 'markdown': {
      // Store raw markdown text in DB, no R2 upload needed
      result.content = file.buffer.toString('utf-8');
      result.extractedText = result.content.substring(0, 50000); // cap for index
      break;
    }

    case 'pdf': {
      // Upload to R2, extract text for search
      const { key } = await storage.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype
      );
      result.fileKey = key;

      try {
        const parsed = await pdfParse(file.buffer);
        result.extractedText = parsed.text.substring(0, 50000);
      } catch {
        // Some PDFs are image-only; text extraction fails silently
        result.extractedText = '';
      }
      break;
    }

    case 'docx': {
      // Upload original to R2 for download
      const { key } = await storage.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype
      );
      result.fileKey = key;

      // Convert to sanitised HTML and store in DB
      const { value: html } = await mammoth.convertToHtml({
        buffer: file.buffer,
      });
      result.content = cleanHtml(html);

      // Extract plain text for search
      const { value: text } = await mammoth.extractRawText({
        buffer: file.buffer,
      });
      result.extractedText = text.substring(0, 50000);
      break;
    }
  }

  return result;
};

// ── Service methods ──────────────────────────

export const listNotes = async ({ subject, tag, type, page, limit }) => {
  const filter = {};
  if (subject) filter.subject = subject;
  if (tag) filter.tags = tag;
  if (type) filter.type = type;

  const skip = (page - 1) * limit;
  const [notes, total] = await Promise.all([
    Note.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('subject', 'name slug')
      .lean(),
    Note.countDocuments(filter),
  ]);

  return {
    notes,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getNoteById = async (id) => {
  const note = await Note.findById(id)
    .populate('subject', 'name slug')
    .lean();

  if (!note) throw new AppError('Note not found', 404);

  // Generate signed URL for PDF/DOCX originals
  if (note.fileKey) {
    note.signedUrl = await storage.getSignedUrl(note.fileKey);
  }

  return note;
};

export const createNote = async (body, file, userId) => {
  // Verify subject exists
  const subjectExists = await Subject.findById(body.subject);
  if (!subjectExists) throw new AppError('Subject not found', 404);

  let noteData = {
    title: body.title,
    subject: body.subject,
    chapter: body.chapter || '',
    tags: body.tags || [],
    order: body.order || 0,
    uploadedBy: userId,
  };

  if (file) {
    // File upload path
    const processed = await processFile(file);
    noteData = { ...noteData, ...processed };
  } else if (body.content) {
    // Inline markdown (no file)
    noteData.type = 'markdown';
    noteData.content = body.content;
    noteData.extractedText = body.content.substring(0, 50000);
  } else {
    throw new AppError('Either a file or markdown content is required', 400);
  }

  const note = await Note.create(noteData);
  return note.populate('subject', 'name slug');
};

export const updateNote = async (id, body, file) => {
  const existing = await Note.findById(id);
  if (!existing) throw new AppError('Note not found', 404);

  // If a new subject is provided, verify it exists
  if (body.subject) {
    const subjectExists = await Subject.findById(body.subject);
    if (!subjectExists) throw new AppError('Subject not found', 404);
  }

  // If a new file is uploaded, process it and delete the old R2 object
  if (file) {
    const processed = await processFile(file);

    // Delete old R2 object if it exists and is being replaced
    if (existing.fileKey) {
      await storage.deleteFile(existing.fileKey);
    }

    Object.assign(existing, body, processed);
  } else {
    // Text-only update
    if (body.content !== undefined) {
      existing.content = body.content;
      existing.extractedText = body.content.substring(0, 50000);
    }
    // Apply other fields
    const { content, ...otherFields } = body;
    Object.assign(existing, otherFields);
  }

  await existing.save();
  return existing.populate('subject', 'name slug');
};

export const deleteNote = async (id) => {
  const note = await Note.findById(id);
  if (!note) throw new AppError('Note not found', 404);

  // Delete R2 object if present
  if (note.fileKey) {
    await storage.deleteFile(note.fileKey);
  }

  await note.deleteOne();
  return note;
};

export const reorderNotes = async (items) => {
  const ops = items.map(({ id, order }) => ({
    updateOne: {
      filter: { _id: id },
      update: { order },
    },
  }));
  await Note.bulkWrite(ops);
};

export const searchNotes = async ({ q, page, limit }) => {
  const skip = (page - 1) * limit;

  const [notes, total] = await Promise.all([
    Note.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .populate('subject', 'name slug')
      .lean(),
    Note.countDocuments({ $text: { $search: q } }),
  ]);

  // Add simple snippet highlighting
  const results = notes.map((note) => {
    const searchTerms = q.toLowerCase().split(/\s+/);
    const source = note.extractedText || note.content || note.title;
    let snippet = '';

    // Find the first occurrence of any search term and extract surrounding context
    for (const term of searchTerms) {
      const idx = source.toLowerCase().indexOf(term);
      if (idx !== -1) {
        const start = Math.max(0, idx - 80);
        const end = Math.min(source.length, idx + term.length + 80);
        snippet = (start > 0 ? '...' : '') +
          source.substring(start, end) +
          (end < source.length ? '...' : '');
        break;
      }
    }

    if (!snippet) {
      snippet = source.substring(0, 160) + (source.length > 160 ? '...' : '');
    }

    return { ...note, snippet };
  });

  return {
    results,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
