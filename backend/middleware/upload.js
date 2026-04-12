const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Chemin absolu vers uploads/ à la racine du backend
const uploadsDir = path.join(__dirname, "..", "uploads");

// Crée le dossier s'il n'existe pas
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Dossier uploads/ créé");
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir); // 👈 chemin absolu
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;