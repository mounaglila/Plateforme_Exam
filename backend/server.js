const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

const allowedOrigins = [
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

app.get('/', (req, res) => res.send('Backend fonctionne !'));
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err); // stack trace complet
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

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
  } catch (err) {
    console.log("Mongo connect failed:", err);
    process.exit(1);
  }
}

start();