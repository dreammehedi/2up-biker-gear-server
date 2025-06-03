import dotenv from "dotenv";
import nodemailer from "nodemailer";
import decrypt from "../helper/decrypt.js";
import ContactUser from "../models/contact.model.js";
import {
  ContactInformation,
  LogoAndFavicon,
} from "../models/siteConfiguration.model.js";
import EmailConfiguration from "./../models/emailConfigurationModal.js";
dotenv.config();

const getData = async (req, res) => {
  try {
    const { skip, limit } = req.pagination;
    const search = req.query.search || "";
    const searchRegex = new RegExp(search, "i");

    // Build the base query
    let query = {
      $or: [{ name: searchRegex }, { email: searchRegex }],
    };

    const data = await ContactUser.find(query).skip(skip).limit(limit);
    const totalDataCount = await ContactUser.countDocuments(query);

    // Respond with the data
    res.status(200).json({
      success: true,
      payload: data,
      pagination: {
        totalData: totalDataCount,
        totalPages: Math.ceil(totalDataCount / limit),
        currentPage: req.pagination.page,
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addData = async (req, res) => {
  const { name, email, message, phone, subject } = req.body;

  // Validate required fields
  const missingFields = [];
  if (!name) missingFields.push("User name");
  if (!email) missingFields.push("Email address");
  if (!message) missingFields.push("Message");
  if (!phone) missingFields.push("Phone number");
  if (!subject) missingFields.push("Subject");

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `${missingFields.join(", ")} field(s) are required.`,
    });
  }

  try {
    // Query email configuration from the database
    const emailConfig = await EmailConfiguration.findOne();

    if (!emailConfig) {
      return res.status(500).json({
        success: false,
        message: "Email configuration not found",
      });
    }

    const {
      emailUserName,
      emailPassword,
      emailHost,
      emailPort,
      emailFromName,
      emailAddress,
      emailEncryption,
    } = emailConfig;

    // Decrypt the password
    const decryptedPassword = decrypt(emailPassword);
    if (!decryptedPassword) {
      return res.status(500).json({
        success: false,
        message: "Failed to decrypt email password",
      });
    }

    // Create the email transport configuration
    const transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailEncryption, // Boolean value
      auth: {
        user: emailUserName,
        pass: decryptedPassword,
      },
    });

    const contactInformationData = await ContactInformation.find();
    const logoAndFaviconData = await LogoAndFavicon.find();

    const mailOptions = {
      clientMailOptions: {
        from: `${emailFromName} <${emailUserName}>`,
        to: email,
        subject: "Thanks for Contacting 2UP Biker Gear",
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #fff; color: #000; line-height: 1.6; margin: 0; padding: 0; }
            .container { max-width: 650px; margin: 20px auto; padding: 30px; background: #fff; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1); }
            .header { text-align: center; padding-bottom: 30px; }
            .header img { max-width: 180px; height: auto; }
            h2 { color: #fca500; font-size: 32px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; }
            p { margin: 12px 0; font-size: 16px; color: #333; }
            .details { background: #f9f9f9; padding: 20px; border-left: 5px solid #fca500; margin: 20px 0; }
            .details p { margin: 10px 0; font-size: 15px; }
            .details strong { color: #000; font-weight: 600; }
            a { color: #fca500; text-decoration: none; font-weight: 600; transition: color 0.3s; }
            a:hover { color: #cc8500; text-decoration: underline; }
            .footer { text-align: center; font-size: 13px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
            .highlight { color: #fca500; font-weight: 700; }
            .btn { display: inline-block; padding: 10px 20px; background-color: #fca500; color: #fff; text-decoration: none; margin-top: 20px; font-weight: 600; transition: background-color 0.3s; }
            .btn:hover { background-color: #cc8500; color: #fff; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <img src="${
                  logoAndFaviconData[0]?.logo
                }" alt="2UP Biker Gear Logo" />
              </div>
              <h2>Thank You, ${name}!</h2>
              <p>Hey <span class="highlight">${name}</span>,</p>
              <p>We’ve received your message! Thanks for reaching out to <strong>2UP Biker Gear</strong>. We’ll get back to you as soon as possible.</p>
              <div class="details">
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
                ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ""}
                <p><strong>Message:</strong> ${message}</p>
                <p><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              <p>Need quick help? Feel free to call us at <a href="tel:${
                contactInformationData[0]?.phoneNumber
              }">${
          contactInformationData[0]?.phoneNumber
        }</a> or just reply to this email.</p>
              <p class="highlight">Ride safe, stay geared up!</p>
              <p>Best,<br />The 2UP Biker Gear Team</p>
              <a href="https://2up-biker-gear-frontend.vercel.app/" class="btn">Visit Our Website</a>
              <div class="footer">
                <p>2UP Biker Gear | Contact us at <a href="mailto:${
                  contactInformationData[0]?.email
                }">${contactInformationData[0]?.email}</a></p>
              </div>
            </div>
          </body>
          </html>
        `,
      },

      adminMailOptions: {
        from: `${emailFromName} <${emailUserName}>`,
        to: emailAddress,
        subject: "New Contact Inquiry - 2UP Biker Gear",
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #fff; color: #000; line-height: 1.6; margin: 0; padding: 0; }
            .container { max-width: 650px; margin: 20px auto; padding: 30px; background: #fff; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1); }
            .header { text-align: center; padding-bottom: 30px; }
            .header img { max-width: 180px; height: auto; }
            h2 { color: #fca500; font-size: 32px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; }
            p { margin: 12px 0; font-size: 16px; color: #333; }
            .details { background: #f9f9f9; padding: 20px; border-left: 5px solid #fca500; margin: 20px 0; }
            .details p { margin: 10px 0; font-size: 15px; }
            .details strong { color: #000; font-weight: 600; }
            a { color: #fca500; text-decoration: none; font-weight: 600; transition: color 0.3s; }
            a:hover { color: #cc8500; text-decoration: underline; }
            .footer { text-align: center; font-size: 13px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
            .highlight { color: #fca500; font-weight: 700; }
            .btn { display: inline-block; padding: 10px 20px; background-color: #fca500; color: #fff; text-decoration: none; margin-top: 20px; font-weight: 600; transition: background-color 0.3s; }
            .btn:hover { background-color: #cc8500; color: #fff; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <img src="${
                  logoAndFaviconData[0]?.logo
                }" alt="2UP Biker Gear Logo" />
              </div>
              <h2>New Contact Submission</h2>
              <p>Hello Team,</p>
              <p>You’ve received a new message from <span class="highlight">${name}</span> (${email}). Here are the details:</p>
              <div class="details">
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
                ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ""}
                <p><strong>Message:</strong> ${message}</p>
                <p><strong>Received:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              <p>Follow up with them if needed. Quick access? Call <a href="tel:${
                contactInformationData[0]?.phoneNumber
              }">${
          contactInformationData[0]?.phoneNumber
        }</a> or reply to this email.</p>
              <p class="highlight">Keep the ride smooth!</p>
              <p>Best,<br />2UP Biker Gear Team</p>
              <a href="https://2up-biker-gear-frontend.vercel.app/" class="btn">View Website</a>
              <div class="footer">
                <p>2UP Biker Gear | Contact: <a href="mailto:${
                  contactInformationData[0]?.email
                }">${contactInformationData[0]?.email}</a></p>
              </div>
            </div>
          </body>
          </html>
        `,
      },
    };

    await transporter.sendMail(mailOptions.clientMailOptions);
    await transporter.sendMail(mailOptions.adminMailOptions);

    // Save the contact data to the database
    const newContactUser = new ContactUser({
      name,
      email,
      message,
      phone: phone,
      subject: subject,
    });

    await newContactUser.save();

    // Respond with success
    res.status(200).json({ success: true, message: "Contact us successful!" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error.message ||
        "An error occurred while processing the contact request.",
    });
  }
};

export { addData, getData };
