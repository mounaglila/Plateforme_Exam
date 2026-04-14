const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

// ✅ Crée le dossier uploads/ automatiquement s'il n'existe pas
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Dossier uploads/ créé');
}

const allowedOrigins = [
  "http://localhost",
  "http://127.0.0.1",
  "http://localhost:80",
  "http://127.0.0.1:80",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
];
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(null, false);
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);
app.use(express.json());

mongoose.set("bufferCommands", false);
const teacherRoutes = require('./routes/teacherRoutes');
const userRoutes = require('./routes/userRoutes');
const studentRoutes = require("./routes/studentRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/student", studentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/professor', teacherRoutes);
app.use("/api/admin", adminRoutes);
app.use("/uploads", express.static(uploadsDir)); // ✅ chemin absolu

app.get('/', (req, res) => res.send('Backend fonctionne !'));

// ✅ Health check endpoint pour Docker
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({ message: err.message || "Server error" });
});

mongoose.connection.on("connected", () => console.log("Mongoose connected"));
mongoose.connection.on("error", (err) => console.log("Mongoose error:", err));
mongoose.connection.on("disconnected", () => console.log("Mongoose disconnected"));

async function start() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connecté");

    const User = require("./models/User");
    const Exam = require("./models/Exam");
    await User.updateMany({ enrollmentStatus: { $exists: false } }, { $set: { enrollmentStatus: "active" } });
    await Exam.updateMany({ adminApproved: { $exists: false } }, { $set: { adminApproved: true } });
    await Exam.updateMany({ adminApproved: true, published: false }, { $set: { published: true } });

    // Legacy data fix (non-fatal): ensure every question has an _id for answer binding.
    try {
      const exams = await Exam.find({ "questions.0": { $exists: true } }).select("_id questions").lean();
      const ops = [];

      for (const ex of exams) {
        let changed = false;
        const nextQuestions = (ex.questions || []).map((q) => {
          if (!q || typeof q !== "object" || Array.isArray(q)) return q;
          if (q._id) return q;
          changed = true;
          return { ...q, _id: new mongoose.Types.ObjectId() };
        });

        if (changed) {
          ops.push({
            updateOne: {
              filter: { _id: ex._id },
              update: { $set: { questions: nextQuestions } },
            },
          });
        }
      }

      if (ops.length) {
        await Exam.bulkWrite(ops);
        console.log(`Legacy questions migration applied on ${ops.length} exam(s)`);
      }
    } catch (migrationErr) {
      console.error("Legacy questions migration skipped:", migrationErr.message);
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
  } catch (err) {
    console.log("Mongo connect failed:", err);
    process.exit(1);
  }
}

start();