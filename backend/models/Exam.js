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

<<<<<<< HEAD
  maxAttempts: { type: Number, default: 1 },
  showCorrection: { type: Boolean, default: false },
}, { timestamps: true });
=======
    questions: [questionSchema],
  },
  { timestamps: true }
);

// Ne jamais envoyer la bonne réponse par défaut (sécurité)
examSchema.path("questions.correctIndex").select(false);
examSchema.index({ published: 1, startAt: 1, endAt: 1 });
examSchema.index({ title: "text", description: "text" });
>>>>>>> e14d67717872626572ca26f459dc7898e8ed7781

module.exports = mongoose.model("Exam", examSchema);