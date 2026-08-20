import mongoose from "mongoose";
import logger from "./logger";
export const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("Connected successfully to MongoDB");
  } catch (err) {
    logger.error("Erorr Connecting to the database", {
      message: err.message,
    });

    process.exit(1);
  }
};
