import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.model.js';

dotenv.config();

// Environment variables are required - no fallbacks with sensitive data
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is required');
  process.exit(1);
}

const adminData = {
  firstName: process.env.ADMIN_FIRSTNAME || 'Admin',
  lastName: process.env.ADMIN_LASTNAME || 'User',
  username: process.env.ADMIN_USERNAME || 'admin',
  email: process.env.ADMIN_EMAIL || 'admin@example.com',
  password: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
  role: 'admin',
  phone: process.env.ADMIN_PHONE || '1234567890',
  address: process.env.ADMIN_ADDRESS || 'City, Country',
  avatar: {
    url: '/uploads/default-avatar.png',
    public_id: null
  }
};

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI, { retryWrites: true, w: 'majority' });
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: adminData.email });
    if (existing) {
      console.log('Admin user already exists:', existing.email);
      process.exit(0);
    }

    const admin = new User(adminData);
    await admin.save();
    console.log('Admin user created:', admin.email);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
}

seedAdmin();