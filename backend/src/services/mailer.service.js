const nodemailer = require('nodemailer');

let transporter;

function isConfigured() {
  return Boolean(process.env.GMAIL_USER?.trim() && process.env.GMAIL_APP_PASSWORD?.trim());
}

function getTransporter() {
  if (!isConfigured()) {
    throw new Error('GMAIL_USER and GMAIL_APP_PASSWORD must be configured to send email');
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER.trim(),
        pass: process.env.GMAIL_APP_PASSWORD.replace(/\s+/g, ''),
      },
    });
  }

  return transporter;
}

async function sendEmail({ to, subject, text }) {
  const sender = process.env.GMAIL_FROM?.trim() || process.env.GMAIL_USER.trim();
  return getTransporter().sendMail({ from: sender, to, subject, text });
}

module.exports = { isConfigured, sendEmail };
