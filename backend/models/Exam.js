const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  durationMinutes: Number,
  questions: Array,

  pdfUrl: String, // 🔥 AJOUT PDF

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  published: { type: Boolean, default: false },
  adminApproved: { type: Boolean, default: false },

  startAt: Date,
  endAt: Date,

  maxAttempts: { type: Number, default: 1 },
  showCorrection: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Exam", examSchema);