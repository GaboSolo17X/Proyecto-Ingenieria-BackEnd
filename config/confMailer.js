import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: "gmail",
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
});

export default transporter;
