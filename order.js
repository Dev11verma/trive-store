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

const FIRST50_LIMIT = 50;
let first50UsedCount = 0;

app.get('/api/promo-status/:code', (req, res) => {
  const code = String(req.params.code || '').trim().toUpperCase();
  if (code === 'FIRST50') {
    const remaining = Math.max(0, FIRST50_LIMIT - first50UsedCount);
    return res.json({ code: 'FIRST50', available: remaining > 0, remaining, limit: FIRST50_LIMIT });
  }
  return res.json({ code, available: true });
});
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    brand: 'TRIVÉ // HEAVYWEAR',
    port: PORT,
    sheetWebhookConfigured: Boolean(process.env.GOOGLE_SHEET_WEBHOOK),
    timestamp: new Date().toISOString()
  });
});

app.post('/api/order', async (req, res) => {
  const appliedPromo = String(req.body?.promoCode || req.body?.couponCode || '').trim().toUpperCase();
  if (appliedPromo === 'FIRST50') {
    if (first50UsedCount >= FIRST50_LIMIT) return res.status(400).json({ success: false, message: 'FIRST50 limit (50 orders) reached.' });
    first50UsedCount += 1;
  }
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

    // 2. Forward to Google Apps Script (Logs to Sheet + Sends Gmail via GmailApp + Pushes to Qikink)
    let sheetSynced = false;
    let sheetError = null;
    if (process.env.GOOGLE_SHEET_WEBHOOK) {
      try {
        const primaryItem = orderRecord.items[0] || {};
        const scriptPayload = {
          orderId,
          paymentMode,
          utr,
          items: orderRecord.items,
          customer: orderRecord.customer,
          product: {
            name: orderRecord.items.map((i) => `${i.name} (${i.color}/${i.size} x${i.quantity})`).join(', ') || primaryItem.name,
            price: String(orderRecord.totalAmount)
          },
          payment: {
            paymentId: `${paymentMode} // ${utr}`
          },
          address: orderRecord.address
        };
        const gsRes = await fetch(process.env.GOOGLE_SHEET_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          redirect: 'follow',
          body: JSON.stringify(scriptPayload)
        });
        const gsText = await gsRes.text();
        sheetSynced = gsRes.ok;
        console.log(`[TRIVÉ Apps Script Sync]: #${orderId} -> status=${gsRes.status} body=${gsText.slice(0, 150)}`);
      } catch (gsErr) {
        sheetError = gsErr.message;
        console.error('[TRIVÉ Apps Script Webhook Error]:', gsErr.message);
      }
    } else {
      sheetError = 'GOOGLE_SHEET_WEBHOOK not set in Render Environment';
    }

    console.log(`[TRIVÉ ORDER LOGGED] #${orderId} | sheetSynced=${sheetSynced}`);

    return res.status(200).json({
      success: true,
      orderId,
      sheetSynced,
      sheetError,
      message: 'Order logged and synced to Google Sheet & Gmail.',
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


const paidUpiRefs = new Set();

app.post('/api/payment-confirm', (req, res) => {
  const ref = String(req.body?.refId || req.body?.tr || req.body?.reference || '').trim();
  if (!ref) {
    return res.status(400).json({ success: false, message: 'Missing payment reference ID.' });
  }
  paidUpiRefs.add(ref);
  return res.json({ success: true, refId: ref, status: 'PAID', paid: true });
});

app.get('/api/payment-status/:refId', (req, res) => {
  const ref = String(req.params.refId || '').trim();
  const isPaid = paidUpiRefs.has(ref);
  return res.json({
    refId: ref,
    paid: isPaid,
    status: isPaid ? 'PAID' : 'PENDING'
  });
});

app.get('/api/orders', (req, res) => {
  const orders = readOrdersSafe();
  res.json({ count: orders.length, orders });
});

app.listen(PORT, () => {
  console.log(`⚡ TRIVÉ Backend Server running on port ${PORT}`);
});

process.on('uncaughtException', (err) => {
  console.error('[TRIVÉ Uncaught Guard]:', err.message || err);
});
process.on('unhandledRejection', (err) => {
  console.error('[TRIVÉ Rejection Guard]:', err && err.message ? err.message : err);
});


