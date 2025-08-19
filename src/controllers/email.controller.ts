import { Request, Response } from "express"
import { testEmail } from "src/emails/test.email"
import { config } from "../config/config"
import { registerEmail } from "src/emails/register.email"

export const sendTestEmail = async (req: Request, res: Response) => {
    if (!config.email.activate) {
        return res.send({
            success: false,
            message: "Email is not activated",
        })
    }
    try {
        if (!req.body.email) {
            throw new Error("body.email is required")
        }
        const info = await registerEmail({
            to: req.body.email,
            url: "http://localhost:3000/api/auth/verify-token?token=khgasiufckgbukqewasb"
        })

        return res.send({
            success: true,
            message: "Test email send successfully",
            info
        })
    } catch (error) {
        console.log('error', error);
        return res.send({
            success: false,
            message: "Error while sending email",
            error
        })
    }
}