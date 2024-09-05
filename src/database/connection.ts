import mongoose from "mongoose";
import config from "../config";
export const connectionDB = async () => {
  try {
    mongoose.connect(`${config.MONGODB_URL}`).then(() => {
      console.log("Connected Success OK!");
    });
  } catch (error) {
    console.log(error);
  }
};
