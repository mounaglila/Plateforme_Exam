const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["mcq", "qcm", "text"], default: "qcm" },
    prompt: { type: String, trim: true },
    questionText: { type: String, trim: true },
    options: [{ type: String, trim: true }],
    correctIndex: { type: Number, select: false },
    points: { type: Number, default: 1, min: 0 },
  },
  { _id: true }
);
const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  durationMinutes: Number,
  type: { type: String, enum: ["qcm", "pdf"], default: "qcm" },
  questions: { type: [questionSchema], default: [] },

  pdfUrl: String,

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

   
// Ne jamais envoyer la bonne réponse par défaut (sécurité)
examSchema.index({ published: 1, startAt: 1, endAt: 1 });
examSchema.index({ title: "text", description: "text" });


module.exports = mongoose.model("Exam", examSchema);