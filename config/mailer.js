const nodemailer = require('nodemailer');

// Create the transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


// Add this inside config/mailer.js
async function sendPasswordResetEmail(userEmail, resetCode) {
    try {
        await transporter.sendMail({
            from: `"Todo App Support" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: "Password Reset Code",
            html: `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Here is your secret code:</p>
        <h1 style="color: blue; font-size: 24px;">${resetCode}</h1>
        <p>This code will expire in 15 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `
        });
        console.log("Reset email sent successfully!");
    } catch (error) {
        console.error("Error sending reset email:", error);
    }
}
module.exports = { sendPasswordResetEmail };