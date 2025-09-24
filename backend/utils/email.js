const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendWelcomeEmail = async (email, fullName) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Welcome to Turf Management System',
        text: `Hii ${fullName},

Welcome to Turf Management System!

We are excited to have you on board.

You can now log in and start booking turfs.

If you have any questions, feel free to contact us.

Best regards,
Turf Management Team`
    };

    await transporter.sendMail(mailOptions);
};

const sendResetEmail = async (email, resetToken) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset - Turf Management System',
        text: `You requested a password reset.

Click this link to reset: http://localhost:5173/reset-password?token=${resetToken}

If you didn't request this, ignore this email.

Best regards,
Turf Management Team`
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendWelcomeEmail, sendResetEmail };