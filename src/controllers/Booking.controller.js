import nodemailer from "nodemailer";
import stripeConfig from "../config/stripe.config.js";
import decrypt from "../helper/decrypt.js";
import Booking from "../models/Booking.model.js";
import EmailConfiguration from "../models/emailConfigurationModal.js";
import {
  ContactInformation,
  LogoAndFavicon,
  ReservationFeedback,
} from "../models/siteConfiguration.model.js";
import SpotsRvPark from "../models/SpotsRvPark.model.js";
const getRecentBookingData = async (req, res) => {
  try {
    const { skip, limit } = req.pagination;
    const search = req.query.search || "";
    const searchRegex = new RegExp(search, "i");

    // Get the date 7 days ago from now
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Main query
    let query = {
      $and: [
        { createdAt: { $gte: sevenDaysAgo } },
        {
          $or: [
            { name: searchRegex },
            { email: searchRegex },
            { phone: searchRegex },
            { type: searchRegex },
            { paymentId: searchRegex },
            { paymentMethod: searchRegex },
            { paymentStatus: searchRegex },
            { title: searchRegex },
            { address: searchRegex },
          ],
        },
      ],
    };

    const data = await Booking.find(query)
      .populate("selectedSpot")
      .skip(skip)
      .limit(limit);
    const totalDataCount = await Booking.countDocuments(query);

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

const getData = async (req, res) => {
  try {
    const { skip, limit } = req.pagination;
    const search = req.query.search || "";
    const searchRegex = new RegExp(search, "i");

    // Determine the query based on the source and search term
    let query = {
      $or: [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { type: searchRegex },
        { paymentId: searchRegex },
        { paymentMethod: searchRegex },
        { paymentStatus: searchRegex },
        { title: searchRegex },
        { address: searchRegex },
      ],
    };

    const data = await Booking.find(query)
      .populate("selectedSpot")
      .skip(skip)
      .limit(limit);
    const totalDataCount = await Booking.countDocuments(query);

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

const getBookingData = async (req, res) => {
  try {
    const data = await Booking.find().populate("selectedSpot");

    // Respond with the data
    res.status(200).json({
      success: true,
      payload: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const createPaymentIntent = async (req, res) => {
  const stripe = await stripeConfig();
  try {
    const { totalPrice, currency = "usd", metadata = {} } = req.body;

    // Validate required fields
    const missingFields = [];

    if (!totalPrice) missingFields.push("Total price");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${missingFields.join(", ")} field(s) are required.`,
      });
    }
    const totalPricePrice = parseInt(totalPrice);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPricePrice * 100),
      currency,
      metadata,
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent?.client_secret,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Payment failed", error: err.message });
  }
};

function dayBefore(dateStr) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

function dayAfter(dateStr) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

const createBooking = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      RVVehicleType,
      vehicleLength,
      specialRequests,
      title,
      address,
      description,
      type,
      price,
      totalPrice,
      paymentStatus,
      paymentId,
      paymentMethod,
      paymentDate,
      paymentAmount,
      selectedSpot,
    } = req.body;

    const missingFields = [];
    if (!name) missingFields.push("Name");
    if (!email) missingFields.push("Email");
    if (!phone) missingFields.push("Phone");
    if (!checkInDate) missingFields.push("Check-in date");
    if (!checkOutDate) missingFields.push("Check-out date");
    if (!numberOfGuests) missingFields.push("Number of guests");
    if (!totalPrice) missingFields.push("Total price");
    if (!paymentStatus) missingFields.push("Payment status");
    if (!paymentId) missingFields.push("Payment ID");
    if (!paymentMethod) missingFields.push("Payment method");
    if (!paymentDate) missingFields.push("Payment date");
    if (!paymentAmount) missingFields.push("Payment amount");
    if (!selectedSpot) missingFields.push("Selected spot");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${missingFields.join(", ")} field(s) are required.`,
      });
    }

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const stripe = await stripeConfig();

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);

    let receiptUrl = null;

    if (paymentIntent?.latest_charge) {
      const charge = await stripe.charges.retrieve(paymentIntent.latest_charge);
      receiptUrl = charge.receipt_url;
    }

    // Optional: generate your own order ID
    const invoiceId = `INV_${Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase()}`;

    // Optional: generate your own order ID
    const orderId = `ORD_${Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase()}`;

    const booking = new Booking({
      name,
      email,
      phone,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      RVVehicleType: RVVehicleType || "",
      vehicleLength: vehicleLength || 0,
      specialRequests: specialRequests || "",
      title,
      address,
      description,
      type,
      price,
      totalPrice,
      currency: "usd",
      metadata: {},
      paymentStatus,
      paymentId,
      paymentMethod,
      paymentDate,
      paymentAmount,
      invoiceId,
      receiptUrl,
      orderId,
      selectedSpot,
    });

    await booking.save();

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
      emailEncryption,
    } = emailConfig;

    const decryptedPassword = decrypt(emailPassword);

    const transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailEncryption?.includes("ssl"),
      auth: {
        user: emailUserName,
        pass: decryptedPassword,
      },
    });

    const contactInformationData = await ContactInformation.find();
    const logoAndFaviconData = await LogoAndFavicon.find();
    const reservationFeedback = await ReservationFeedback.find();

    //  spots rv park data date updating

    const findSelectedSpot = await SpotsRvPark.findById(selectedSpot);
    if (!findSelectedSpot) {
      return res
        .status(404)
        .json({ success: false, message: "Spot not found." });
    }

    const { availability } = findSelectedSpot;
    const { available = [], booked = [] } = availability || {};

    const checkIn = new Date(checkInDate).toISOString().split("T")[0];
    const checkOut = new Date(checkOutDate).toISOString().split("T")[0];

    // Add new booked range
    const updatedBooked = [...booked, { from: checkIn, to: checkOut }];

    // Process and split available ranges
    const updatedAvailable = [];
    for (const range of available) {
      const from = range.from;
      const to = range.to;

      // Case: booked range inside available range (split it)
      if (from <= checkIn && (to === "future" || to >= checkOut)) {
        // Before check-in
        if (from < checkIn) {
          updatedAvailable.push({ from, to: dayBefore(checkIn) });
        }

        // After check-out
        if (to === "future" || checkOut < to) {
          updatedAvailable.push({ from: dayAfter(checkOut), to });
        }
      } else {
        // No conflict, keep original
        updatedAvailable.push(range);
      }
    }

    // Final update
    findSelectedSpot.isAvailable = 0; // optional: just mark spot as "taken"
    findSelectedSpot.availability.booked = updatedBooked;
    findSelectedSpot.availability.available = updatedAvailable;

    await findSelectedSpot.save();

    const mailOptions = {
      from: `${emailFromName} <${emailUserName}>`,
      to: email,
      subject: reservationFeedback[0]?.subject || "Booking Confirmation",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
              }" alt="A Step Above RV Park Logo" />
            </div>
            <h2>Booking Confirmed!</h2>
            <p>Dear <span class="highlight">${name}</span>,</p>
            <p>Your adventure at <strong class="highlight">${title}</strong> is officially locked in! Here are your details:</p>
            <div class="details">
              <p><strong>Check-in Date:</strong> ${new Date(
                checkInDate
              ).toLocaleDateString()}</p>
              <p><strong>Check-out Date:</strong> ${new Date(
                checkOutDate
              ).toLocaleDateString()}</p>
              <p><strong>Number of Guests:</strong> ${numberOfGuests}</p>
              <p><strong>RV Vehicle Type:</strong> ${RVVehicleType} (${vehicleLength} ft)</p>
              <p><strong>Selected Spot:</strong> ${findSelectedSpot?.title}</p>
              <p><strong>Total Paid:</strong> $${(paymentAmount / 100).toFixed(
                2
              )}</p>
              ${
                receiptUrl
                  ? `<p><strong>Receipt:</strong> <a href="${receiptUrl}" target="_blank">View Receipt</a></p>`
                  : ""
              }
              ${
                invoiceId
                  ? `<p><strong>Invoice ID:</strong> ${invoiceId}</p>`
                  : ""
              }
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Special Requests:</strong> ${specialRequests}</p>
            </div>
            <p>Get ready for an epic stay in the Ozark Mountains near Table Rock Lake. Questions? Reach out at <a href="tel:${
              contactInformationData[0]?.phoneNumber
            }">${
        contactInformationData[0]?.phoneNumber
      }</a> or hit reply—we’ve got you covered.</p>
            <p class="highlight">See you soon under the stars!</p>
            <p>Best,<br>The A Step Above RV Park Crew</p>
            <a href="https://2up-biker-gear-frontend.vercel.app" class="btn">Explore Our Park</a>
            <div class="footer">
                <p>A Step Above RV Park | Lake Harmony, PA | Email: <a href="mailto:${
                  contactInformationData[0]?.email
                }">${contactInformationData[0]?.email}</a></p>
              </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      return res.status(500).json({
        success: false,
        message: "Booking saved, but failed to send confirmation email.",
        error: emailError.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking created and confirmation email sent successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while creating the booking",
      error: error.message,
    });
  }
};

const getBookingDetailsData = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Booking ID is required." });
  }

  try {
    const booking = await Booking.findById(id).populate("selectedSpot");

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found." });
    }

    res.status(200).json({
      success: true,
      payload: booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  createBooking,
  createPaymentIntent,
  getBookingData,
  getBookingDetailsData,
  getData,
  getRecentBookingData,
};
