import nodemailer from "nodemailer";
import EmailConfiguration from "../models/emailConfigurationModal";

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const emailConfigData = await EmailConfiguration.findOne();

    const decryptedPassword = decrypt(emailConfigData?.emailPassword);
    if (!decryptedPassword) {
      throw new Error("Failed to decrypt email password");
    }

    // Create a transporter using SMTP configuration
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: emailConfigData?.emailAddress,
        pass: decryptedPassword,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Define email options
    const mailOptions = {
      from: emailConfigData?.emailAddress,
      to,
      subject,
      html: htmlContent,
    };

    // Send email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw error;
  }
};

module.exports = sendEmail;
