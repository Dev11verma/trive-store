const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

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
    brevoConfigured: Boolean(process.env.BREVO_API_KEY),
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

    // 2. Build HTML Email
    const itemsHtml = orderRecord.items
      .map(
        (item) =>
          `<li><strong>${item.name}</strong> (SKU: ${item.sku || 'TRV'}) — ${item.color} / Size ${item.size} × ${item.quantity} — ₹${item.price}</li>`
      )
      .join('');

    const senderEmail = process.env.GMAIL_USER || 'support.trive@gmail.com';
    const subject = `[NEW ORDER #${orderId}] ₹${orderRecord.totalAmount} • ${customer.name} (${paymentMode})`;
    const htmlContent = `
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
    `;

    // 3. Send via Brevo HTTPS API (Port 443 - never blocked on Render Free Tier)
    let emailSent = false;
    let emailError = null;
    if (process.env.BREVO_API_KEY) {
      try {
        const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': process.env.BREVO_API_KEY,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            sender: { name: 'TRIVÉ // ARCHIVAL ORDERS', email: senderEmail },
            to: [{ email: 'support.trive@gmail.com', name: 'TRIVÉ Dispatch' }],
            subject,
            htmlContent
          })
        });
        const brevoData = await brevoRes.json();
        if (brevoRes.ok) {
          emailSent = true;
          console.log(`[TRIVÉ Brevo Email Sent]: #${orderId} -> messageId=${brevoData.messageId}`);
        } else {
          emailError = brevoData.message || JSON.stringify(brevoData);
          console.error('[TRIVÉ Brevo Error]:', emailError);
        }
      } catch (err) {
        emailError = err.message;
        console.error('[TRIVÉ Brevo Fetch Error]:', err.message);
      }
    } else {
      emailError = 'BREVO_API_KEY not set in Render Environment';
      console.warn('[TRIVÉ Email Warning]:', emailError);
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

process.on('uncaughtException', (err) => {
  console.error('[TRIVÉ Uncaught Guard]:', err.message || err);
});
process.on('unhandledRejection', (err) => {
  console.error('[TRIVÉ Rejection Guard]:', err && err.message ? err.message : err);
});
