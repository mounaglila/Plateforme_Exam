const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    // pour mcq
    selectedIndex: { type: Number },
    // pour text
    textAnswer: { type: String },
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    answers: { type: [answerSchema], default: [] },

    status: { type: String, enum: ["submitted", "graded"], default: "submitted" },
    score: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

submissionSchema.index({ exam: 1, student: 1, createdAt: -1 });

module.exports = mongoose.model("Submission", submissionSchema);