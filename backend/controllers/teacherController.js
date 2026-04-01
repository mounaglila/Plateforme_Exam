const Teacher = require('../models/Teacher'); // on créera ce modèle juste après
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerTeacher = async (req, res) => {
  try {
    const { name, email, password, subject } = req.body;

    // vérifier si l'email existe déjà
    const existing = await Teacher.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email déjà utilisé' });

    // hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await Teacher.create({
      name,
      email,
      password: hashedPassword,
      subject
    });

    // créer token JWT
    const token = jwt.sign({ id: teacher._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ _id: teacher._id, name, email, subject, token });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
};

const loginTeacher = async (req, res) => {
  try {
    const { email, password } = req.body;
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(400).json({ message: 'Email ou mot de passe invalide' });

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) return res.status(400).json({ message: 'Email ou mot de passe invalide' });

    const token = jwt.sign({ id: teacher._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ _id: teacher._id, name: teacher.name, email, subject: teacher.subject, token });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { registerTeacher, loginTeacher };