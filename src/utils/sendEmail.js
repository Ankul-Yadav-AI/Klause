import nodemailer from 'nodemailer';
import { loadConfig } from '../config/loadConfig.js';

const sendEmail = async ({ email, subject, body , attachments = []}) => {
    try {
        const config = await loadConfig();
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.EMAIL_USER,
                pass: config.EMAIL_PASS
            }
        });

        const mailOptions = {
            from:  `"Via Menu 2.0" <${config.EMAIL_USER}>`,
            to: email,
            subject: subject,
            text: body,
            attachments: attachments
        };

        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

export { sendEmail };