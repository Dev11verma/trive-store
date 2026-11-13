const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// Unified Order Endpoint for Web, Email & WhatsApp Concierge
app.post('/api/order', async (req, res) => {
  try {
    const { customer, product, color, size, quantity, utr, address } = req.body;

    // Validate required fields
    if (!customer || !customer.name || !customer.phone || !product) {
      return res.status(400).json({ success: false, message: 'Missing required customer or product details.' });
    }

    // Generate unique order ID
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `TV-${randomNum}`;

    // Format WhatsApp concierge dispatch message
    const waText = `⚡ *NEW TRIVÉ ARCHIVAL ORDER* ⚡\n\n` +
      `*Order ID:* #${orderId}\n` +
      `*Customer:* ${customer.name} (${customer.phone})\n` +
      `*Item(s):* ${product.name}\n` +
      `*Color/Size:* ${color} / Size ${size} (Qty: ${quantity})\n` +
      `*Total Amount:* ₹${product.price}\n` +
      `*Payment Ref (UTR):* ${utr}\n` +
      `*Shipping Address:* ${address.street}, ${address.city} ${address.pincode} (${address.state})`;

    const encodedMessage = encodeURIComponent(waText);
    const whatsappLink = `https://wa.me/919202142350?text=${encodedMessage}`;

    // Configure SMTP transporter using Render's environment variables
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    // Setup email content
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: customer.email || process.env.GMAIL_USER,
      subject: `🚨 New Order Confirmed: #${orderId} (${customer.name})`,
      text: `New order received on TRIVÉ!\n\n` +
            `Order ID: #${orderId}\n` +
            `Customer Name: ${customer.name}\n` +
            `Phone: ${customer.phone}\n` +
            `Items: ${product.name}\n` +
            `Color: ${color}\n` +
            `Size: ${size}\n` +
            `Quantity: ${quantity}\n` +
            `Total Amount: ₹${product.price}\n` +
            `Payment UTR: ${utr}\n\n` +
            `Delivery Address:\n` +
            `- ${address.street}, ${address.city}, ${address.state} - ${address.pincode}\n\n` +
            `Thank you for shopping with TRIVÉ.`
    };

    // Send email notification via Nodemailer
    await transporter.sendMail(mailOptions);
    console.log(`[ORDER SUCCESS] Email notification sent and web order #${orderId} logged for ${customer.name}`);

    return res.status(200).json({
      success: true,
      orderId: orderId,
      whatsappLink: whatsappLink,
      message: 'Order successfully processed, email sent, and queued for dispatch.'
    });

  } catch (err) {
    console.error("Order or email processing error:", err);
    return res.status(500).json({ success: false, message: "Server error processing order", error: err.message });
  }
});

// Bind to Render PORT or default local 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`TRIVÉ API Backend running successfully on port ${PORT}`);
});