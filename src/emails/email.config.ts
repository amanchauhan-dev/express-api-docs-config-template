import nodemailer from "nodemailer"
import { config } from "../config/config"

// Create a test account or replace with real credentials.
export const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: false,
    auth: {
        user: config.email.user,
        pass: config.email.password,
    },
});
