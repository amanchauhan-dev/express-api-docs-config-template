import cron from "node-cron";
import axios from "axios";
import { config } from "../config/config"; // adjust path

export const pingServerJob = () => {
    cron.schedule("* * * * *", async () => {
        try {
            await axios.get(config.server.url + '/health');
            console.log(`[CRON] Server pinged at ${new Date().toISOString()}`);
        } catch (error: any) {
            console.error("[CRON] Failed to ping server:", error?.message);
        }
    });
};
