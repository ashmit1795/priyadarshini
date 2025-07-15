import { SENDER_EMAIL } from "../config/env.js";
import sendEmail from "../config/nodemailer.js";

const contactUs = async (req, res) => { 
    try {
        const { name, email, message } = req.body;

        // Validate input
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        // Send email using the sendEmail function from nodemailer config
        await sendEmail({
            to: SENDER_EMAIL,
            subject: "New Contact Us Message - Priyadarshini",
            body: `You have received a new message from ${name} (${email}): ${message}`,
            fromAlias: "+contact",
            displayName: "Priyadarshini Contact"
        });

        // Send a response email to the user
        await sendEmail({
            to: email,
            subject: "Thank you for contacting Priyadarshini",
            body: `Dear ${name},<br><br>Thank you for reaching out to us. We have received your message and will get back to you shortly.<br><br>Best regards,<br>Priyadarshini Team`,
            fromAlias: "+contact",
            displayName: "Priyadarshini Contact"
        });

        return res.status(200).json({ success: true, message: "Message sent successfully." });
    } catch (error) {
        console.error("Error in contactUs controller:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}

export { contactUs };
