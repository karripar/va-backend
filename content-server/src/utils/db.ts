import mongoose from "mongoose";
import dotenv from "dotenv";
import CustomError from "../classes/CustomError";

dotenv.config();

const mangustiConnection = async () => {
  try {
    if (!process.env.DB_URL) {
      throw new CustomError("No database connection string found in env", 500);
    }

    const connection = await mongoose.connect(process.env.DB_URL);
    const dbName = mongoose.connection.db?.databaseName || 'unknown';
    console.log("MongoDB connected successfully to", process.env.DB_URL.split('@')[1]?.split('/')[0] || 'database');
<<<<<<< HEAD
    console.log(` Using database: ${dbName}`);
=======
<<<<<<< HEAD
    console.log(` Using database: ${dbName}`);
=======
    console.log(`==> Using database: ${dbName}`);
>>>>>>> b86a9ce81d039e744dd27e979e116eed320fe429
>>>>>>> dev-test
    return connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export default mangustiConnection;
