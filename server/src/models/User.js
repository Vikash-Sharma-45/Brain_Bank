import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const noteStatusSchema = new mongoose.Schema(
  {
    note: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', required: true },
    status: {
      type: String,
      enum: ['not_started', 'reading', 'revised'],
      default: 'not_started',
    },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const recentlyViewedSchema = new mongoose.Schema(
  {
    note: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', required: true },
    viewedAt: { type: Date, default: Date.now },
    position: { type: Number, default: 0 }, // scroll % or page number
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'reader'], default: 'reader' },
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }],
    recentlyViewed: [recentlyViewedSchema],
    noteStatus: [noteStatusSchema],
  },
  { timestamps: true }
);

// ── Instance methods ─────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// ── Pre-save hook: hash password when set ────
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// Never return passwordHash in JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
