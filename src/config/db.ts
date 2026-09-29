import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/image_processing';
  try {
    await mongoose.connect(mongoUri);
  } catch (error) {
    process.exit(1);
  }
};
