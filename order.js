const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 5000,
  auth: {
    user: process.env.GMAIL_USER || 'support.trive@gmail.com',
    pass: process.env.GMAIL_PASS || process.env.GMAIL_APP_PASS || 'alzj xglx cenv ielm'
  }
});

const ORDERS_FILE = path.join(__dirname, 'orders.json');
if (!fs.existsSync(ORDERS_FILE)) {
  fs.writeFileSync(ORDERS_FILE, '[]', 'utf8');
}

function readOrdersSafe() {
  try {
    const raw = fs.readFileSync(ORDERS_FILE, 'utf8').replace(/^\uFEFF/, '').trim();
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    brand: 'TRIVÉ // HEAVYWEAR',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/order', async (req, res) => {
  try {
    const {
      customer = {},
      product = {},
      items = [],
      color = 'Standard',
      size = 'L',
      quantity = 1,
      utr = 'COD_ORDER',
      paymentMode = 'UPI',
      address = {}
    } = req.body;

    if (!customer.name || !customer.phone || !address.street || !address.city) {
      return res.status(400).json({
        success: false,
        message: 'Missing required customer or shipping fields.'
      });
    }

    const orderId = `TV-${Date.now().toString().slice(-6)}`;
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const orderRecord = {
      orderId,
      timestamp,
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email || 'support.trive@gmail.com'
      },
      items:
        items.length > 0
          ? items
          : [{ name: product.name, sku: product.sku, color, size, quantity, price: product.price }],
      totalAmount: product.price || 0,
      paymentMode,
      utr,
      address: {
        street: address.street,
        city: address.city,
        state: address.state || 'Madhya Pradesh',
        pincode: address.pincode || ''
      },
      fulfillmentStatus: 'QUEUED_FOR_QIKINK'
    };

    // 1. Save Order Locally
    const existingOrders = readOrdersSafe();
    existingOrders.unshift(orderRecord);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(existingOrders, null, 2), 'utf8');

    // 2. Build Email Payload
    const itemsText = orderRecord.items
      .map((i) => `${i.name} (${i.color} / ${i.size}) x${i.quantity} - ₹${i.price}`)
      .join(' | ');

    const itemsHtml = orderRecord.items
      .map(
        (item) =>
          `<li><strong>${item.name}</strong> (SKU: ${item.sku || 'TRV'}) — ${item.color} / Size ${item.size} × ${item.quantity} — ₹${item.price}</li>`
      )
      .join('');

    const senderEmail = process.env.GMAIL_USER || 'support.trive@gmail.com';
    const mailOptions = {
      from: `"TRIVÉ // ARCHIVAL ORDERS" <${senderEmail}>`,
      to: 'support.trive@gmail.com',
      subject: `[NEW ORDER #${orderId}] ₹${orderRecord.totalAmount} • ${customer.name} (${paymentMode})`,
      html: `
        <div style="font-family:Arial,sans-serif;background:#0a0a0c;color:#f4f4f5;padding:24px;border-radius:10px;border:1px solid #27272a;">
          <h2 style="color:#d7ff3e;margin-top:0;">NEW TRIVÉ ARCHIVAL ORDER // #${orderId}</h2>
          <p style="color:#a1a1aa;font-size:13px;">Placed on ${timestamp} IST</p>
          <hr style="border-color:#27272a;" />
          <h3 style="color:#fff;">Customer & Shipping</h3>
          <p>
            <strong>Name:</strong> ${customer.name}<br/>
            <strong>Phone / WhatsApp:</strong> ${customer.phone}<br/>
            <strong>Address:</strong> ${orderRecord.address.street}, ${orderRecord.address.city}, ${orderRecord.address.state} - ${orderRecord.address.pincode}
          </p>
          <h3 style="color:#fff;">Payment Verification</h3>
          <p>
            <strong>Mode:</strong> ${paymentMode}<br/>
            <strong>UTR / Ref:</strong> <span style="color:#d7ff3e;font-weight:bold;">${utr}</span><br/>
            <strong>Total Paid / Payable:</strong> ₹${orderRecord.totalAmount}
          </p>
          <h3 style="color:#fff;">Garments to Print & Dispatch</h3>
          <ul>${itemsHtml}</ul>
        </div>
      `
    };

    // 3. Try SMTP with 5s timeout, fallback to HTTPS FormSubmit relay (never blocked on Render)
    let emailSent = false;
    let emailError = null;
    try {
      await Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_, reject) => setTimeout(() => reject(new Error('SMTP_TIMEOUT_5S')), 5000))
      ]);
      emailSent = true;
      console.log(`[TRIVÉ SMTP Sent]: #${orderId}`);
    } catch (smtpErr) {
      emailError = smtpErr.message;
      console.warn(`[TRIVÉ SMTP Fallback (${smtpErr.message})]: Sending via HTTPS relay...`);
      try {
        const relayRes = await fetch('https://formsubmit.co/ajax/support.trive@gmail.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            _subject: `[NEW ORDER #${orderId}] ₹${orderRecord.totalAmount} • ${customer.name} (${paymentMode})`,
            Order_ID: orderId,
            Timestamp: `${timestamp} IST`,
            Customer_Name: customer.name,
            Phone: customer.phone,
            Address: `${orderRecord.address.street}, ${orderRecord.address.city}, ${orderRecord.address.state} - ${orderRecord.address.pincode}`,
            Payment_Mode: paymentMode,
            UTR: utr,
            Total_Amount: `₹${orderRecord.totalAmount}`,
            Items: itemsText
          })
        });
        const relayData = await relayRes.json();
        if (relayRes.ok && (relayData.success === 'true' || relayData.success === true)) {
          emailSent = true;
          emailError = null;
          console.log(`[TRIVÉ HTTPS Relay Sent]: #${orderId}`);
        } else {
          emailError = relayData.message || 'HTTPS relay activation required';
        }
      } catch (relayErr) {
        emailError = relayErr.message;
      }
    }

    console.log(`[TRIVÉ ORDER LOGGED] #${orderId} | ${customer.name} | ₹${orderRecord.totalAmount} | emailSent=${emailSent}`);

    return res.status(200).json({
      success: true,
      orderId,
      emailSent,
      emailError,
      message: 'Order logged and queued for dispatch.',
      order: orderRecord
    });
  } catch (error) {
    console.error('[TRIVÉ Order API Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while saving order.'
    });
  }
});

app.get('/api/orders', (req, res) => {
  const orders = readOrdersSafe();
  res.json({ count: orders.length, orders });
});

app.listen(PORT, () => {
  console.log(`⚡ TRIVÉ Backend Server running on port ${PORT}`);
  try {
    require('./bot.js');
  } catch (err) {
    console.error('[TRIVÉ Bot Launch Warning]:', err.message);
  }
});
