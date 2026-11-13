const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'abhayvermasoni604@gmail.com',
    pass: 'hsbl aemu uxlg bssl' // Directly hardcoded for testing
  }
});

// Function to send the order notification email
async function sendOrderEmail(orderData) {
  const mailOptions = {
    from: 'abhayvermasoni604@gmail.com',
    to: 'abhayvermasoni604@gmail.com',
    subject: `🚨 New Order Confirmed: #${orderData.orderId}`,
    text: `New order received on TRIVÉ!

Order ID: #${orderData.orderId}
Customer Name: ${orderData.customer?.name}
Phone: ${orderData.customer?.phone}
Items: ${orderData.product?.name}
Color: ${orderData.color}
Size: ${orderData.size}
Total Amount: ₹${orderData.product?.price}
Payment UTR: ${orderData.utr}

Delivery Address:
${orderData.address?.street}, ${orderData.address?.city}, ${orderData.address?.state} - ${orderData.address?.pincode}`
  };

  return transporter.sendMail(mailOptions);
}

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
    const whatsappLink = `https://wa.me/919977798829?text=${encodedMessage}`;

    // Format and send email notification using Nodemailer
    await sendOrderEmail({ customer, product, color, size, quantity, utr, address, orderId });
    console.log(`[ORDER SUCCESS] Email notification sent and web order #${orderId} logged for ${customer.name}`);

    return res.status(200).json({
      success: true,
      orderId: orderId,
      whatsappLink: whatsappLink
    });

  } catch (err) {
    console.error("Order or email processing error:", err);
    res.status(500).json({ success: false, message: "Server error processing order" });
  }
});

app.listen(8080, () => {
  console.log("TRIVÉ API Backend running successfully on port 8080");
});

// Original Web Order & WhatsApp Workflow Endpoint
app.post('/api/order', (req, res) => {
  try {
    const { customer, product, color, size, quantity, utr, address } = req.body;

    // Validate required fields
    if (!customer || !customer.name || !customer.phone || !product) {
      return res.status(400).json({ success: false, message: 'Missing required customer or product details.' });
    }

    // Generate unique order ID
    const orderId = Math.floor(1000 + Math.random() * 9000);
    const trackingId = `TV-${orderId}`;

    // Format WhatsApp concierge dispatch message
    const waText = `⚡ *NEW TRIVÉ ARCHIVAL ORDER* ⚡\n\n` +
      `*Order ID:* #${trackingId}\n` +
      `*Customer:* ${customer.name} (${customer.phone})\n` +
      `*Item(s):* ${product.name}\n` +
      `*Color/Size:* ${color} / Size ${size} (Qty: ${quantity})\n` +
      `*Total Amount:* ₹${product.price}\n` +
      `*Payment Ref (UTR):* ${utr}\n` +
      `*Shipping Address:* ${address.street}, ${address.city} ${address.pincode} (${address.state})`;

    const encodedMessage = encodeURIComponent(waText);
    const whatsappLink = `https://wa.me/919977798829?text=${encodedMessage}`;

    console.log(`[ORDER SUCCESS] Logged web order #${trackingId} for ${customer.name}`);

    return res.status(200).json({
      success: true,
      orderId: trackingId,
      whatsappLink: whatsappLink,
      message: 'Order successfully logged and queued for dispatch.'
    });

  } catch (error) {
    console.error('[ORDER ERROR]:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while logging order.'
    });
  }
});

// Bind to Render PORT or default local 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`TRIVÉ API Backend running successfully on port ${PORT}`);
});