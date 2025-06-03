import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}${process.env.CLUSTER_NAME}/${process.env.DB_NAME}`
    );

    console.log(
      "Database Connected Successfully.",
      connectionInstance.connection.host
    );
  } catch (error) {
    console.log("Database Connection Error!", error);
    process.exit(1);
  }
};
