import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    chapter: { type: String, default: '', trim: true, maxlength: 150 },
    type: {
      type: String,
      enum: ['markdown', 'pdf', 'docx'],
      required: true,
    },
    // Markdown raw text or sanitised HTML from docx conversion
    content: { type: String, default: '' },
    // Private storage object key for pdf/docx originals
    fileKey: { type: String, default: '' },
    originalFilename: { type: String, default: '' },
    fileSize: { type: Number, default: 0 },
    // Plain text extracted from pdf/docx for full-text search
    extractedText: { type: String, default: '' },
    tags: [{ type: String, trim: true, lowercase: true }],
    order: { type: Number, default: 0 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Weighted text index: title > tags > extractedText
noteSchema.index(
  { title: 'text', tags: 'text', extractedText: 'text' },
  { weights: { title: 10, tags: 5, extractedText: 1 }, name: 'note_search' }
);

const Note = mongoose.model('Note', noteSchema);
export default Note;
