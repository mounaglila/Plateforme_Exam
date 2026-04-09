const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },

    // MCQ
    selectedIndex: { type: Number },

    // Texte
    textAnswer: { type: String, trim: true },

    // Correction manuelle (optionnel)
    awardedPoints: { type: Number, default: 0, min: 0 },
    correctionComment: { type: String, default: "" },
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    answers: { type: [answerSchema], default: [] },

    // AJOUT: in_progress pour brouillon/reprise
    status: {
      type: String,
      enum: ["in_progress", "submitted", "graded"],
      default: "in_progress",
      index: true,
    },

    score: { type: Number, default: 0, min: 0 },
    maxScore: { type: Number, default: 0, min: 0 },

    // Tentative
    attemptNumber: { type: Number, default: 1, min: 1 },

    // Temps
    startedAt: { type: Date, default: null, index: true },
    submittedAt: { type: Date, default: null },
    timeSpentSec: { type: Number, default: 0, min: 0 },

    // AJOUT: autosave
    lastSavedAt: { type: Date, default: null },

    // AJOUT: soumission auto quand timer expire
    autoSubmitted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Garde l'unicité d'une tentative
submissionSchema.index(
  { exam: 1, student: 1, attemptNumber: 1 },
  { unique: true }
);

// Pour listing étudiant
submissionSchema.index({ student: 1, createdAt: -1 });

// IMPORTANT: une seule tentative active (in_progress) par exam/étudiant
submissionSchema.index(
  { exam: 1, student: 1, status: 1 },
  { partialFilterExpression: { status: "in_progress" } }
);

module.exports = mongoose.model("Submission", submissionSchema);