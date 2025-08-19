import cron from "node-cron";
import { database } from "src/config/database";

export const cleanupTokensJob = () => {
    cron.schedule("0 * * * *", async () => {
        try {
            const result = await database.prisma.token.deleteMany({
                where: {
                    expires: { lt: new Date() },
                },
            });
            console.log(`[CRON] Deleted ${result.count} expired tokens`);
        } catch (error: any) {
            console.error("[CRON] Error cleaning expired tokens:", error?.message);
        }
    });
};
1