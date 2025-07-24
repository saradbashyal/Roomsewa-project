import mongoose from 'mongoose';
    import dotenv from 'dotenv';

    dotenv.config();

    const connectDB = async () => {
      try {
        await mongoose.connect(process.env.MONGODB_URL, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000,
        });
        console.log('MongoDB connected successfully');
      } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
      }
    };

    export default connectDB;