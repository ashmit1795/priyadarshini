import nodemailer from "nodemailer";
import { EMAIL_APP_PASSWORD, SENDER_EMAIL } from "./env.js";

// Create a transporter for SMTP
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: SENDER_EMAIL,
		pass: EMAIL_APP_PASSWORD,
	},
});

const sendEmail = async ({ to, subject, body}) => {
    const response = await transporter.sendMail({
        from: SENDER_EMAIL,
        to,
        subject,
        html: body
    });
    return response;
}

export default sendEmail;