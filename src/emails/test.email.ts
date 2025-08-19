import { transporter } from "./email.config";
import { config } from "../config/config"

export const testEmail = async () => {
    console.log('pass', config.email.password, config.email.address);
    const info = await transporter.sendMail({
        from: `"${config.email.senderName}" <${config.email.address}>`,
        to: config.email.address,
        subject: "Test Email",
        text: `Test email.`,
        html: "<b>Test Email ✅</b>",
    });
    return info
};