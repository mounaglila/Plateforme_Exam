const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.set("bufferCommands", false);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);
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

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
  } catch (err) {
    console.log("Mongo connect failed:", err);
    process.exit(1);
  }
}

start();