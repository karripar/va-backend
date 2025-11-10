import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.metropolia.fi',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    ciphers: 'SSLv3',
  },
});

const sendAdminNotification = async (
  name: string,
  email: string,
  subject: string,
  message: string,
  adminEmails: string[],
) => {
  try {
    console.log('Email user from env:', process.env.EMAIL_USER);
    console.log('Email pass from env:', process.env.EMAIL_PASS);

    const mailOptions = {
      from: `"Vaihtoaktivaattori" <${process.env.EMAIL_USER}>`,
      to: adminEmails,
      subject: `Uusi yhteydenotto Vaihtoaktivaattorista: ${subject}`,
      text: `Uusi yhteydenottoviesti:

    Name: ${name}
    Email: ${email}
    Subject: ${subject}

    Message:
    ${message}
    `,
      html: `
          <h2>Uusi viesti vastaanotettu</h2>
          <p><strong>Nimi:</strong> ${name}</p>
          <p><strong>Sähköposti:</strong> ${email}</p>
          <p><strong>Aihe:</strong> ${subject}</p>
          <p><strong>${new Date().toLocaleString('fi-FI')}</strong></p>
          <p><strong>Viesti:</strong></p>
          <blockquote>${message}</blockquote>
        `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    throw new Error('Failed to send admin notification email');
  }
};

export {sendAdminNotification};
