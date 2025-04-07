import { logger } from "@app/utils";
import mongoose from "mongoose";

export function connectDB(uri: string) {
  mongoose
    .connect(uri)
    .then((res) => {
      if (res.connection.readyState === 1) {
        logger.info("Connected to MongoDB");
      } else {
        logger.error(
          `Failed to connect to MongoDB with state: ${res.connection.readyState}`,
        );
      }
    })
    .catch((err) => {
      logger.error(`Failed to connect to MongoDB`, err);
    });
}
