import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI?.trim();

    if (!mongoURI) {
      throw new Error("MONGODB_URI is missing from environment variables");
    }

    await mongoose.connect(mongoURI, {
      dbName: "QuickShow",
    });

    console.log("MongoDB connected successfully:", mongoose.connection.name);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

export default connectDB;
