import { transporter } from "./email.config";
import { config } from "../config/config"
import fs from "fs";
import path from "path";

export const registerEmail = async ({ to, url }: {
    to: string,
    url: string
}) => {
    const templatePath = path.join(__dirname, "./templates/register.email.html");
    let html = fs.readFileSync(templatePath, "utf-8");

    // replace placeholder
    html = html.replace(/{{url}}/g, url);

    const info = await transporter.sendMail({
        from: `"${config.email.senderName}" <${config.email.address}>`,
        to: to,
        subject: "Email Verification",
        text: `Verify Your email. click the link to verify:${url}`,
        html: html,
    });
    return info
};