const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["mcq", "text"], required: true },
    prompt: { type: String, required: true },
    options: [{ type: String }],        // pour mcq
    correctIndex: { type: Number },     // caché côté étudiant via select:false
    points: { type: Number, default: 1 },
  },
  { _id: true }
);

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    durationMinutes: { type: Number, default: 30 },
    published: { type: Boolean, default: false },
    /** After professor publishes, false until an admin approves (students only see approved exams). */
    adminApproved: { type: Boolean, default: true },
    // NEW: planning + rules
    startAt: { type: Date, default: null },
    endAt: { type: Date, default: null },
    maxAttempts: { type: Number, default: 1, min: 1 },
    showCorrection: { type: Boolean, default: false },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    questions: [questionSchema],
  },
  { timestamps: true }
);

// Ne jamais envoyer la bonne réponse par défaut (sécurité)
examSchema.path("questions.correctIndex").select(false);
examSchema.index({ published: 1, startAt: 1, endAt: 1 });
examSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Exam", examSchema);