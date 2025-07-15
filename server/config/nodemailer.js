import nodemailer from "nodemailer";
import { EMAIL_APP_PASSWORD, SENDER_EMAIL, SMTP_PASS } from "./env.js";

// Create a transporter for Gmail
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: SENDER_EMAIL,
		pass: EMAIL_APP_PASSWORD,
	},
});

// // Create a transporter for Resend SMTP
// const transporter = nodemailer.createTransport({
// 		host: "smtp.resend.com",
// 		// secure: true,
// 		port: 465,
// 		auth: {
// 			user: "resend",
// 			pass: SMTP_PASS, // Use your SMTP password here
// 		},
// });

const sendEmail = async ({ to, subject, body, fromAlias = "", displayName = "Priyadarshini" }) => {
    const fromAddress = fromAlias ? appendAlias(SENDER_EMAIL, fromAlias) : SENDER_EMAIL;
    // Send the email
    const response = await transporter.sendMail({
        from: `${displayName} <${fromAddress}>`,
        to,
        subject,
        html: body
    });
    return response;
}

export default sendEmail;

// Utility function to append alias to email address
function appendAlias(email, alias) {
	const [local, domain] = email.split("@");
	return `${local}${alias}@${domain}`;
}