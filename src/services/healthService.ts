import mongoose from "mongoose";

import { connectDB } from "@/lib/db/mongoose";

export interface HealthStatus {
  status: "ok" | "degraded";
  database: "connected" | "disconnected";
  timestamp: string;
}

export class HealthService {
  async check(): Promise<HealthStatus> {
    const timestamp = new Date().toISOString();

    try {
      await connectDB();
      await mongoose.connection.db?.admin().ping();

      return {
        status: "ok",
        database: "connected",
        timestamp,
      };
    } catch {
      return {
        status: "degraded",
        database: "disconnected",
        timestamp,
      };
    }
  }
}
