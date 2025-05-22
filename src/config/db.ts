import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined");
    }
    
    await mongoose.connect(mongoUri);
    console.log(`MongoDB connected successfully ${mongoose.connection.host}`);
    
  } catch (error) {
    console.log(`MongoDB connection Failed: ${error}`);
  }
}

export default connectDB