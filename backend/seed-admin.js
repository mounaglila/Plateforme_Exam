const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connecté');

    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('Un admin existe déjà. Abandon.');
      process.exit(0);
    }

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@edusmart.com',
      password: '123456',
      role: 'admin',
      enrollmentStatus: 'active',
    });

    console.log(' Admin créé:', admin.email);
    process.exit(0);
  } catch (err) {
    console.error(' Erreur:', err.message);
    process.exit(1);
  }
}

seedAdmin();