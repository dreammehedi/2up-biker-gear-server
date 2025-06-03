import nodemailer from "nodemailer";
import stripeConfig from "../config/stripe.config.js";
import decrypt from "../helper/decrypt.js";
import EmailConfiguration from "../models/emailConfigurationModal.js";
import Order from "../models/Order.model.js";
import {
  ContactInformation,
  LogoAndFavicon,
} from "../models/siteConfiguration.model.js";
const getRecentOrderData = async (req, res) => {
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
            { firstName: searchRegex },
            { lastName: searchRegex },
            { email: searchRegex },
            { phone: searchRegex },
            { paymentId: searchRegex },
            { paymentMethod: searchRegex },
            { paymentStatus: searchRegex },
            { address: searchRegex },
            { city: searchRegex },
            { state: searchRegex },
            { zipCode: searchRegex },
          ],
        },
      ],
    };

    const data = await Order.find(query).skip(skip).limit(limit);
    const totalDataCount = await Order.countDocuments(query);

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
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { paymentId: searchRegex },
        { paymentMethod: searchRegex },
        { paymentStatus: searchRegex },
        { address: searchRegex },
        { city: searchRegex },
        { state: searchRegex },
        { zipCode: searchRegex },
      ],
    };

    const data = await Order.find(query).skip(skip).limit(limit);
    const totalDataCount = await Order.countDocuments(query);

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

const getOrderData = async (req, res) => {
  try {
    const data = await Order.find();

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

const createOrder = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      address,
      city,
      state,
      zipCode,
      shippingCost,
      couponDiscount,
      billingAddress,
      email,
      phone,
      paymentId,
      paymentMethod,
      paymentAmount,
      paymentDate,
      products, // Array of products from frontend
    } = req.body;

    const requiredFields = [
      { value: firstName, name: "First name" },
      { value: lastName, name: "Last name" },
      { value: address, name: "Address" },
      { value: city, name: "City" },
      { value: state, name: "State" },
      { value: zipCode, name: "Zip code" },
      { value: email, name: "Email" },
      { value: phone, name: "Phone" },
      { value: paymentId, name: "Payment ID" },
      { value: paymentMethod, name: "Payment Method" },
      { value: paymentAmount, name: "Payment Amount" },
      { value: paymentDate, name: "Payment Date" },
      { value: products, name: "Products" },
    ];

    const missingFields = requiredFields
      .filter((field) => !field.value)
      .map((field) => field.name);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${missingFields.join(", ")} field(s) are required.`,
      });
    }

    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }
    // 1. Get Stripe receipt URL
    const stripe = await stripeConfig();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
    const latestCharge = paymentIntent?.latest_charge;
    let receiptUrl = null;

    if (latestCharge) {
      const charge = await stripe.charges.retrieve(latestCharge);
      receiptUrl = charge?.receipt_url || null;
    }

    // 2. Generate IDs
    const invoiceId = `INV_${Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase()}`;
    const orderId = `ORD_${Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase()}`;

    // 3. Calculate total price based on product subtotals
    const enrichedProducts = products.map((product) => {
      const subtotal = product?.price * product?.quantity;
      return {
        ...product,
        subtotal,
      };
    });
    // const totalPrice = enrichedProducts.reduce(
    //   (acc, p) =>
    //     acc + (p.subtotal + (shippingCost || 0)) - couponDiscount || 0,
    //   0
    // );

    // 4. Save to DB
    const newOrder = new Order({
      firstName,
      lastName,
      address,
      city,
      state,
      zipCode,
      shippingCost: shippingCost || 0,
      couponDiscount: couponDiscount || 0,
      billingAddress: billingAddress || "",
      email,
      phone,
      products: enrichedProducts,
      totalPrice: paymentAmount,
      paymentStatus: "success",
      paymentId,
      paymentMethod,
      paymentDate,
      paymentAmount,
      invoiceId,
      receiptUrl,
      orderId,
    });

    await newOrder.save();

    // 5. Send confirmation email (your existing nodemailer logic can go here...)

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

    // const mailOptions = {
    //   from: `${emailFromName} <${emailUserName}>`,
    //   to: email,
    //   subject: "Order Confirmation",
    //   html: `
    //     <!DOCTYPE html>
    //     <html lang="en">
    //     <head>
    //       <meta charset="UTF-8" />
    //       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    //       <style>
    //         body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #fff; color: #000; margin: 0; padding: 0; }
    //         .container { max-width: 650px; margin: 20px auto; padding: 30px; background: #fff; box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
    //         .header { text-align: center; padding-bottom: 30px; }
    //         .header img { max-width: 180px; height: auto; }
    //         h2 { color: #fca500; font-size: 32px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; }
    //         p { margin: 12px 0; font-size: 16px; color: #333; }
    //         .details { background: #f9f9f9; padding: 20px; border-left: 5px solid #fca500; margin: 20px 0; }
    //         .details p { margin: 10px 0; font-size: 15px; }
    //         .details strong { color: #000; font-weight: 600; }
    //         a { color: #fca500; text-decoration: none; font-weight: 600; transition: color 0.3s; }
    //         a:hover { color: #cc8500; text-decoration: underline; }
    //         .footer { text-align: center; font-size: 13px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
    //         .highlight { color: #fca500; font-weight: 700; }
    //         .btn { display: inline-block; padding: 10px 20px; background-color: #fca500; color: #fff; text-decoration: none; margin-top: 20px; font-weight: 600; transition: background-color 0.3s; }
    //         .btn:hover { background-color: #cc8500; }
    //       </style>
    //     </head>
    //     <body>
    //       <div class="container">
    //         <div class="header">
    //           <img src="${
    //             logoAndFaviconData[0]?.logo || "#"
    //           }" alt="2Up Biker Gear Logo" />
    //         </div>
    //         <h2>Order Confirmed!</h2>
    //         <p>Dear <span class="highlight">${firstName} ${lastName}</span>,</p>
    //         <p>Thank you for your order! Below are the details of your purchase:</p>

    //         <div class="details">
    //           <p><strong>Order ID:</strong> ${orderId}</p>
    //           ${
    //             invoiceId
    //               ? `<p><strong>Invoice ID:</strong> ${invoiceId}</p>`
    //               : ""
    //           }
    //           ${
    //             receiptUrl
    //               ? `<p><strong>Receipt:</strong> <a href="${receiptUrl}" target="_blank" rel="noopener noreferrer">View Receipt</a></p>`
    //               : ""
    //           }
    //         </div>

    //         <p>Need help? Call us at <a href="tel:${
    //           contactInformationData[0]?.phoneNumber || ""
    //         }">${
    //     contactInformationData[0]?.phoneNumber || "Phone Number Unavailable"
    //   }</a> or just reply to this email—we’re happy to help!</p>

    //         <p class="highlight">See you soon under the stars!</p>
    //         <p>Best regards,<br>The 2Up Biker Gear Team</p>

    //         <a href="https://2up-biker-gear-frontend.vercel.app" class="btn">Explore Our Website</a>

    //         <div class="footer">
    //           <p>2Up Biker Gear | Email:
    //           <a href="mailto:${
    //             contactInformationData[0]?.email || "info@twoupbikergear.com"
    //           }">${
    //     contactInformationData[0]?.email || "info@twoupbikergear.com"
    //   }</a></p>
    //         </div>
    //       </div>
    //     </body>
    //     </html>
    //   `,
    // };

    //   const adminMailOptions = {
    //     from: `${emailFromName} <${emailUserName}>`,
    //     // to: process.env.ADMIN_EMAIL || "info@twoupbikergear.com",
    //     to: "dreammehedihassan@gmail.com",
    //     subject: "Order Confirmation",
    //     html: `
    //   <!DOCTYPE html>
    //   <html lang="en">
    //   <head>
    //     <meta charset="UTF-8" />
    //     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    //     <style>
    //       body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #fff; color: #000; margin: 0; padding: 0; }
    //       .container { max-width: 650px; margin: 20px auto; padding: 30px; background: #fff; box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
    //       .header { text-align: center; padding-bottom: 30px; }
    //       .header img { max-width: 180px; height: auto; }
    //       h2 { color: #fca500; font-size: 32px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; }
    //       p { margin: 12px 0; font-size: 16px; color: #333; }
    //       .details { background: #f9f9f9; padding: 20px; border-left: 5px solid #fca500; margin: 20px 0; }
    //       .details p { margin: 10px 0; font-size: 15px; }
    //       .details strong { color: #000; font-weight: 600; }
    //       a { color: #fca500; text-decoration: none; font-weight: 600; transition: color 0.3s; }
    //       a:hover { color: #cc8500; text-decoration: underline; }
    //       .footer { text-align: center; font-size: 13px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
    //       .highlight { color: #fca500; font-weight: 700; }
    //       .btn { display: inline-block; padding: 10px 20px; background-color: #fca500; color: #fff; text-decoration: none; margin-top: 20px; font-weight: 600; transition: background-color 0.3s; }
    //       .btn:hover { background-color: #cc8500; }
    //     </style>
    //   </head>
    //   <body>
    //     <div class="container">
    //       <div class="header">
    //         <img src="${
    //           logoAndFaviconData[0]?.logo || "#"
    //         }" alt="2Up Biker Gear Logo" />
    //       </div>
    //       <h2>Order Confirmed!</h2>
    //       <p>Dear <span class="highlight">Scott Parneg</span>,</p>
    //       <p>New product order! Below are the details of your purchase:</p>

    //       <div class="details">
    //         <p><strong>Order ID:</strong> ${orderId}</p>
    //         ${invoiceId ? `<p><strong>Invoice ID:</strong> ${invoiceId}</p>` : ""}
    //         ${
    //           receiptUrl
    //             ? `<p><strong>Receipt:</strong> <a href="${receiptUrl}" target="_blank" rel="noopener noreferrer">View Receipt</a></p>`
    //             : ""
    //         }
    //       </div>

    //       <div class="footer">
    //         <p>2Up Biker Gear | Email:
    //         <a href="mailto:${
    //           contactInformationData[0]?.email || "info@twoupbikergear.com"
    //         }">${
    //       contactInformationData[0]?.email || "info@twoupbikergear.com"
    //     }</a></p>
    //       </div>
    //     </div>
    //   </body>
    //   </html>
    // `,
    //   };

    const mailOptions = {
      from: `${emailFromName} <${emailUserName}>`,
      to: email,
      subject: "Order Confirmation",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #fff; color: #000; margin: 0; padding: 0; }
            .container { max-width: 650px; margin: 20px auto; padding: 30px; background: #fff; box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
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
            .btn:hover { background-color: #cc8500; }
            .order-summary { margin-top: 20px; }
            .order-summary table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .order-summary th, .order-summary td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; font-size: 14px; }
            .order-summary th { background-color: #fca500; color: white; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${
                logoAndFaviconData[0]?.logo || "#"
              }" alt="2Up Biker Gear Logo" />
            </div>
    
            <h2>Order Confirmed!</h2>
            <p>Dear <span class="highlight">${firstName} ${lastName}</span>,</p>
            <p>Thank you for your order! Below are the details of your purchase:</p>
    
            <div class="details">
              <p><strong>Order ID:</strong> ${orderId}</p>
              ${
                invoiceId
                  ? `<p><strong>Invoice ID:</strong> ${invoiceId}</p>`
                  : ""
              }
              ${
                receiptUrl
                  ? `<p><strong>Receipt:</strong> <a href="${receiptUrl}" target="_blank" rel="noopener noreferrer">View Receipt</a></p>`
                  : ""
              }
              <p><strong>Email:</strong> ${email}</p>
            </div>
    
            <div class="order-summary">
              <h3 style="font-size: 18px; color: #333; margin-bottom: 10px;">Ordered Products</h3>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Coupon Discount</th>
                    <th>Shipping Cost</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    enrichedProducts
                      ?.map(
                        (product) => `
                        <tr>
                          <td>${product?.name?.slice(0, 50)}...</td>
                          <td>${product?.quantity}</td>
                          <td>$${product?.price.toFixed(2)}</td>
                          <td>$${(product?.shippingCost || 0).toFixed(2)}</td>
                          <td>$${(product?.couponDiscount || 0).toFixed(2)}</td>
                        </tr>
                      `
                      )
                      .join("") ||
                    "<tr><td colspan='3'>No products found</td></tr>"
                  }
                </tbody>
              </table>
            </div>
    
            <p>Need help? Call us at <a href="tel:${
              contactInformationData[0]?.phoneNumber || ""
            }">
              ${
                contactInformationData[0]?.phoneNumber ||
                "Phone Number Unavailable"
              }</a> or just reply to this email—we’re happy to help!</p>
    
            <p class="highlight">See you soon under the stars!</p>
            <p>Best regards,<br>The 2Up Biker Gear Team</p>
    
            <a href="https://2up-biker-gear-frontend.vercel.app" class="btn">Explore Our Website</a>
    
            <div class="footer">
              <p>2Up Biker Gear | Email: 
                <a href="mailto:${
                  contactInformationData[0]?.email || "info@twoupbikergear.com"
                }">
                  ${
                    contactInformationData[0]?.email ||
                    "info@twoupbikergear.com"
                  }
                </a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const adminMailOptions = {
      from: `${emailFromName} <${emailUserName}>`,
      to: "info@twoupbikergear.com",
      subject: "New Order Received",
      html: `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #fff; color: #000; margin: 0; padding: 0; }
      .container { max-width: 650px; margin: 20px auto; padding: 30px; background: #fff; box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
      .header { text-align: center; padding-bottom: 30px; }
      .header img { max-width: 180px; height: auto; }
      h2 { color: #fca500; font-size: 32px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; }
      p { margin: 12px 0; font-size: 16px; color: #333; }
      .details, .product-table { background: #f9f9f9; padding: 20px; border-left: 5px solid #fca500; margin: 20px 0; }
      .details p, .summary p { margin: 10px 0; font-size: 15px; }
      .details strong { color: #000; font-weight: 600; }
      .product-table table { width: 100%; border-collapse: collapse; font-size: 14px; }
      .product-table th, .product-table td { padding: 10px; border: 1px solid #ddd; text-align: left; }
      .product-table th { background-color: #fca500; color: #fff; }
      .highlight { color: #fca500; font-weight: 700; }
      .footer { text-align: center; font-size: 13px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="${
          logoAndFaviconData[0]?.logo || "#"
        }" alt="2Up Biker Gear Logo" />
      </div>
      <h2>New Order Received</h2>
      <p>You have a new order from <span class="highlight">${firstName} ${lastName}</span>.</p>
  
      <div class="details">
        <p><strong>Order ID:</strong> ${orderId}</p>
        ${invoiceId ? `<p><strong>Invoice ID:</strong> ${invoiceId}</p>` : ""}
        ${
          receiptUrl
            ? `<p><strong>Receipt:</strong> <a href="${receiptUrl}" target="_blank">View Receipt</a></p>`
            : ""
        }
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Shipping Address:</strong> ${address}, ${city}, ${state}, ${zipCode}</p>
      </div>
  
      <div class="product-table">
        <h3>Product Details</h3>
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${enrichedProducts
              ?.map(
                (product) => `
              <tr>
                <td>${product?.name?.slice(0, 100)}...</td>
                <td>$${product?.price.toFixed(2)}</td>
                <td>${product?.quantity}</td>
                <td>$${(product?.price * product?.quantity).toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
  
      <div class="summary">
        <p><strong>Shipping Cost:</strong> $${parseFloat(
          shippingCost || 0
        ).toFixed(2)}</p>
        <p><strong>Coupon Discount:</strong> -$${couponDiscount?.toFixed(2)}</p>
        <p><strong>Total Payment:</strong> <span class="highlight">$${(
          paymentAmount / 100
        )?.toFixed(2)}</span></p>
        <p><strong>Payment Status:</strong> success</p>
        <p><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
  
      <div class="footer">
        <p>2Up Biker Gear | Email: 
        <a href="mailto:${
          contactInformationData[0]?.email || "info@twoupbikergear.com"
        }">
          ${contactInformationData[0]?.email || "info@twoupbikergear.com"}
        </a></p>
      </div>
    </div>
  </body>
  </html>
  `,
    };

    try {
      await transporter.sendMail(mailOptions);
      await transporter.sendMail(adminMailOptions);
    } catch (emailError) {
      return res.status(500).json({
        success: false,
        message: "Order saved, but failed to send confirmation email.",
        error: emailError.message,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Order placed successfully",
      payload: {
        firstName,
        lastName,
        address,
        city,
        state,
        zipCode,
        shippingCost,
        billingAddress: billingAddress || "",
        email,
        phone,
        products: enrichedProducts,
        totalPrice: paymentAmount,
        paymentStatus: "success",
        paymentId,
        paymentMethod,
        paymentDate,
        paymentAmount,
        invoiceId,
        receiptUrl,
        orderId,
      },
    });
  } catch (error) {
    console.error("Booking Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while placing the order.",
      error: error.message,
    });
  }
};

const getOrderDetailsData = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Booking ID is required." });
  }

  try {
    const booking = await Order.findById(id);

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
  createOrder,
  createPaymentIntent,
  getData,
  getOrderData,
  getOrderDetailsData,
  getRecentOrderData,
};
