import mongoose from "mongoose";

const cached = globalThis.__quickShowMongo || {
  connection: null,
  promise: null,
};

if (!globalThis.__quickShowMongo) {
  globalThis.__quickShowMongo = cached;
}

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGODB_URI?.trim()) {
    throw new Error("MONGODB_URI is missing from the backend environment variables.");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI.trim(), {
      dbName: process.env.MONGODB_DB_NAME || "QuickShow",
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
    }).then((mongooseInstance) => {
      cached.connection = mongooseInstance.connection;
      console.log("MongoDB connected successfully:", mongooseInstance.connection.name);
      return mongooseInstance;
    }).catch((error) => {
      cached.promise = null;
      console.error("MongoDB connection failed:", error.message);
      throw error;
    });
  }

  await cached.promise;
  return mongoose.connection;
};

export default connectDB;
