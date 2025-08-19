import { pingServerJob } from "./pingServer.job";
import { cleanupTokensJob } from "./cleanupTokens.job";

export const initCronJobs = () => {
    pingServerJob();
    cleanupTokensJob();
};
