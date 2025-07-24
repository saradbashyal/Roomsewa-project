import mongoose from "mongoose";


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log(`MongoDB Connected to ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error(`Failed to connect to MongoDB: ${error.message}`)
        process.exit(1);
    }
}

export default connectDB;