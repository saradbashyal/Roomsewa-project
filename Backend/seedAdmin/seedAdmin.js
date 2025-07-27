
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.model.js';

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb+srv://saradwindows:XFk4r7Zy7zOez0Jj@cluster0.9yhatzr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const adminData = {
  firstName: process.env.ADMIN_FIRSTNAME || 'Admin',
  lastName: process.env.ADMIN_LASTNAME || 'User',
  username: process.env.ADMIN_USERNAME || 'admin',
  email: process.env.ADMIN_EMAIL || 'admin@roomsewa.com',
  password: process.env.ADMIN_PASSWORD || 'Sarad@1',
  role: 'admin',
  phone: process.env.ADMIN_PHONE || '9800000000',
  address: process.env.ADMIN_ADDRESS || 'Kathmandu',
  avatar: {
    url: '/uploads/default-avatar.png',
    public_id: null
  }
};

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URL, { retryWrites: true, w: 'majority' });
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
