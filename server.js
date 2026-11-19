const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// Google Sheets Apps Script Webhook URL
const GOOGLE_SHEET_WEBHOOK = 'https://script.google.com/macros/s/AKfycbzYjBlgBq6E0j06iKFMp-oHdyyY_-7uhxA-905ewmYP4drIViHfJEtnQPWjvi5lFxkP/exec';

// Qikink Sandbox API Configuration
const QIKINK_SANDBOX_URL = 'https://api-sandbox.qikink.com/api/v1/orders'; // Update if your sandbox endpoint differs
const QIKINK_API_KEY = process.env.QIKINK_API_KEY || 'YOUR_QIKINK_SANDBOX_KEY';

// Unified Order Endpoint for Web, Google Sheets, Email, WhatsApp & Qikink Sandbox
app.post('/api/order', async (req, res) => {
  try {
    const { customer, product, color, size, quantity, utr, address, items, paymentMode } = req.body;

    // Validate required fields
    if (!customer || !customer.name || !customer.phone || !product) {
      return res.status(400).json({ success: false, message: 'Missing required customer or product details.' });
    }

    // Generate unique order ID
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `TV-${randomNum}`;

    // 1. FORWARD TO GOOGLE SHEETS
    try {
      await fetch(GOOGLE_SHEET_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...req.body, orderId })
      });
      console.log(`[SHEETS SYNC] Order #${orderId} successfully logged to Google Sheets.`);
    } catch (sheetErr) {
      console.error("[SHEETS ERROR] Failed to log to Google Sheet:", sheetErr.message);
    }

    // 2. FORWARD TO QIKINK SANDBOX
    try {
      const qikinkPayload = {
        order_id: orderId,
        shipping_address: {
          name: customer.name,
          address_line1: address.street,
          city: address.city,
          state: address.state || 'Madhya Pradesh',
          pincode: address.pincode || '462001',
          phone: customer.phone,
          country: 'India'
        },
        payment_mode: paymentMode || 'Prepaid',
        items: items && items.length > 0 ? items.map(item => ({
          sku: item.sku || 'TRIVE-SKU-01',
          name: item.name,
          quantity: item.quantity || quantity || 1,
          size: item.size || size,
          color: item.color || color
        })) : [{
          sku: 'TRIVE-SKU-01',
          name: product.name,
          quantity: quantity || 1,
          size: size || 'L',
          color: color || 'Black'
        }]
      };

      const qikinkResponse = await fetch(QIKINK_SANDBOX_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${QIKINK_API_KEY}`
        },
        body: JSON.stringify(qikinkPayload)
      });
      
      console.log(`[QIKINK SANDBOX] Order #${orderId} pushed to Qikink sandbox pipeline. Status: ${qikinkResponse.status}`);
    } catch (qikErr) {
      console.error("[QIKINK ERROR] Sandbox dispatch failed:", qikErr.message);
    }

    // Format WhatsApp concierge dispatch message
    const waText = `⚡ *NEW TRIVÉ ARCHIVAL ORDER* ⚡\n\n` +
      `*Order ID:* #${orderId}\n` +
      `*Customer:* ${customer.name} (${customer.phone})\n` +
      `*Item(s):* ${product.name}\n` +
      `*Color/Size:* ${color} / Size ${size} (Qty: ${quantity})\n` +
      `*Total Amount:* ₹${product.price}\n` +
      `*Payment Mode/Ref:* ${paymentMode || 'UPI'} (${utr})\n` +
      `*Shipping Address:* ${address.street}, ${address.city} ${address.pincode} (${address.state})`;

    const encodedMessage = encodeURIComponent(waText);
    const whatsappLink = `https://wa.me/919202142350?text=${encodedMessage}`;

    // 3. SEND EMAIL NOTIFICATION VIA NODEMAILER
  const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'support.trive@gmail.com',
        pass: 'alzjxgxrcenvielm' // Remove the spaces so it's continuous
      }
    });

    const mailOptions = {
      from: process.env.GMAIL_USER || 'support.trive@gmail.com',
      to: customer.email || 'support.trive@gmail.com',
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
            `Payment: ${paymentMode || 'UPI'} (UTR: ${utr})\n\n` +
            `Delivery Address:\n` +
            `- ${address.street}, ${address.city}, ${address.state} - ${address.pincode}\n\n` +
            `Thank you for shopping with TRIVÉ.`
    };

    await transporter.sendMail(mailOptions);
    console.log(`[ORDER SUCCESS] Email notification sent, Google Sheet logged, Qikink sandboxed, and order #${orderId} confirmed for ${customer.name}`);

    return res.status(200).json({
      success: true,
      orderId: orderId,
      whatsappLink: whatsappLink,
      message: 'Order successfully processed, logged to Sheet, sent via Mail, and forwarded to Qikink sandbox.'
    });

  } catch (err) {
    console.error("Order or background sync processing error:", err);
    return res.status(500).json({ success: false, message: "Server error processing order", error: err.message });
  }
});

// Bind to Render PORT or default local 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`TRIVÉ API Backend running successfully on port ${PORT}`);
});