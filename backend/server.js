import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.resolve('orders.json');

const QIKINK_CLIENT_ID = process.env.QIKINK_CLIENT_ID || '979710787663166';
const QIKINK_CLIENT_SECRET = process.env.QIKINK_CLIENT_SECRET || 'c4900bae62de3396bc32a9d367293592996dd80fabe80f26a258d3bcf8455d39';

app.use(cors());
app.use(express.json());

function loadOrders() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed reading orders.json', e);
  }
  return [];
}

function saveOrders(ordersList) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(ordersList, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed saving orders.json', e);
  }
}

let orders = loadOrders();

// Resilient Qikink Auth: Checks endpoints and returns token with matching base URL
async function getQikinkAuth() {
  const hosts = [
    'https://api.qikink.com',
    'https://sandbox.qikink.com'
  ];

  for (const host of hosts) {
    try {
      const params = new URLSearchParams();
      params.append('ClientId', QIKINK_CLIENT_ID);
      params.append('client_secret', QIKINK_CLIENT_SECRET);

      const res = await fetch(`${host}/api/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });

      const data = await res.json();
      const token = data?.Accesstoken || data?.access_token || data?.token;
      if (token) {
        console.log(`Qikink Authenticated successfully on: ${host}`);
        return { token, baseUrl: host };
      }
    } catch (e) {
      console.log(`Token fetch failed on ${host}:`, e.message);
    }
  }
  return null;
}

app.get('/', (req, res) => {
  res.json({
    brand: 'TRIVÉ',
    architecture: 'Custom Cloud Storefront + TRIVÉ Engine + Qikink Gateway',
    activeOrders: orders.length,
    status: 'Operational'
  });
});

app.get('/admin', (req, res) => {
  orders = loadOrders();
  const orderCards = orders.slice().reverse().map(o => `
    <div style="background:#141414;border:1px solid #2a2a2a;border-radius:12px;padding:18px;margin-bottom:14px;color:#eee;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <span style="font-weight:900;color:#d7ff3e;font-size:16px;">#${o.orderId}</span>
        <span style="font-size:12px;color:#888;">${o.createdAt}</span>
      </div>
      <div style="font-size:15px;font-weight:bold;margin-bottom:4px;">${o.product}</div>
      <div style="font-size:13px;color:#d7ff3e;margin-bottom:6px;">
        <strong>Color:</strong> ${o.color} &bull; <strong>Size:</strong> ${o.size} &bull; <strong>Qty:</strong> ${o.quantity}
      </div>
      <div style="color:#aaa;font-size:13px;margin-bottom:8px;">
        <strong>Customer:</strong> ${o.customer} (<a href="tel:${o.phone}" style="color:#d7ff3e;">${o.phone}</a>)<br>
        <strong>Address:</strong> ${o.address}<br>
        <strong>Payment:</strong> ₹${o.total.toLocaleString('en-IN')} &bull; ${o.paymentStatus}<br>
        <strong>Qikink Status:</strong> <span style="color:#22c55e;">${o.qikinkStatus || 'Queued'}</span>
      </div>
      <div style="margin-top:10px;display:flex;gap:10px;flex-wrap:wrap;">
        <a href="${o.whatsappLink}" target="_blank" style="background:#25D366;color:#000;text-decoration:none;padding:8px 14px;border-radius:6px;font-size:12px;font-weight:bold;text-transform:uppercase;">
          📲 WhatsApp Customer
        </a>
        <button onclick="navigator.clipboard.writeText(decodeURIComponent('${encodeURIComponent(JSON.stringify(o.qikinkPayload))}')); alert('Qikink payload copied!');" style="background:#222;color:#fff;border:1px solid #444;padding:8px 14px;border-radius:6px;font-size:12px;cursor:pointer;">
          📋 Copy Payload
        </button>
      </div>
    </div>
  `).join('');

  res.send(`
    <!doctype html>
    <html>
      <head>
        <title>TRIVÉ // Command Center</title>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <style>
          body { background:#0a0a0a; color:#fff; font-family:-apple-system,BlinkMacSystemFont,sans-serif; margin:0; padding:20px; }
          .container { max-width:680px; margin:0 auto; }
          h1 { font-size:22px; text-transform:uppercase; letter-spacing:0.1em; color:#fff; margin-bottom:4px; }
          .sub { color:#666; font-size:13px; margin-bottom:24px; text-transform:uppercase; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>TRIVÉ Command Center</h1>
          <div class="sub">Total Orders Logged: ${orders.length}</div>
          ${orders.length ? orderCards : '<div style="color:#555;padding:40px 0;text-align:center;">No orders yet. Place an order from your storefront.</div>'}
        </div>
      </body>
    </html>
  `);
});

app.post('/api/order', async (req, res) => {
  const { customer, product, size, color, quantity, utr, address } = req.body || {};

  if (!customer?.name || !customer?.phone || !address?.city) {
    return res.status(400).json({ error: 'Customer name, phone, and address are required.' });
  }

  orders = loadOrders();
  const orderId = `TV-${1000 + orders.length + 1}`;
  
  let unitPrice = Number(product?.price) || 1299;
  if (unitPrice > 10000) unitPrice = Math.round(unitPrice / 100);

  const qty = parseInt(quantity, 10) || 1;
  const totalAmount = unitPrice;
  const garmentColor = color || product?.color || 'Archival Vintage Washed Black';
  const cleanPhone = customer.phone.replace(/[^0-9]/g, '').slice(-10);

  const waMsg = encodeURIComponent(
    `*TRIVÉ // ORDER CONFIRMED [${orderId}]*\n\n` +
    `Hey ${customer.name},\n` +
    `Your order for *${product?.name || 'TRIVÉ Archival Piece'}* has been confirmed:\n\n` +
    `• *Colorway:* ${garmentColor}\n` +
    `• *Size:* ${size || 'L'}\n` +
    `• *Quantity:* ${qty}\n\n` +
    `📦 *Delivery Destination:* ${address.city}, ${address.pincode}\n` +
    `💰 *Total Amount:* ₹${totalAmount.toLocaleString('en-IN')}\n` +
    `⚡ *Status:* Moving to TRIVÉ Printing & Packaging.\n\n` +
    `We will send your tracking link as soon as it leaves the facility.\n` +
    `_TRIVÉ Heavywear — Lost But Never Broken._`
  );
  const whatsappLink = `https://wa.me/91${cleanPhone}?text=${waMsg}`;

  // Structured Qikink Order Payload
  const qikinkPayload = {
    order_number: orderId,
    order_type: utr?.toUpperCase() === 'COD' ? 'cod' : 'prepaid',
    total_order_value: String(totalAmount),
    first_name: customer.name.split(' ')[0],
    last_name: customer.name.split(' ').slice(1).join(' ') || 'Customer',
    phone_number: cleanPhone,
    address1: address.street,
    city: address.city,
    state: address.state || 'Madhya Pradesh',
    country_code: 'IN',
    zip_code: String(address.pincode),
    line_items: [
      {
        search_from_my_products: 0,
        sku: `TRV-${(size || 'L').toUpperCase()}`,
        quantity: String(qty),
        price: String(unitPrice)
      }
    ]
  };

  let qikinkLiveStatus = 'Queued';
  try {
    const auth = await getQikinkAuth();
    if (auth?.token) {
      // Send universal headers accepted by all Qikink API gateways
      const qikinkRes = await fetch(`${auth.baseUrl}/api/order/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ClientId': QIKINK_CLIENT_ID,
          'Accesstoken': auth.token,
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify(qikinkPayload)
      });
      const qikinkData = await qikinkRes.json();
      console.log('Qikink Response:', qikinkData);

      if (qikinkData?.error) {
        qikinkLiveStatus = `Qikink: ${qikinkData.error}`;
      } else {
        qikinkLiveStatus = qikinkData?.message || qikinkData?.status || `Sent (${auth.baseUrl.includes('sandbox') ? 'Sandbox' : 'Live'})`;
      }
    } else {
      qikinkLiveStatus = 'Auth Pending (Awaiting Live Activation)';
    }
  } catch (err) {
    console.error('Qikink Dispatch Error:', err.message);
    qikinkLiveStatus = 'Dispatch Timeout (Manual Payload Available)';
  }

  const newOrder = {
    orderId,
    brand: 'TRIVÉ',
    product: product?.name || 'TRIVÉ Archival Piece',
    color: garmentColor,
    size: size || 'L',
    quantity: qty,
    total: totalAmount,
    paymentStatus: utr?.toUpperCase() === 'COD' ? 'Pending (COD)' : `Prepaid (UTR: ${utr})`,
    customer: customer.name,
    phone: customer.phone,
    address: `${address.street}, ${address.city}, ${address.state || 'Madhya Pradesh'} - ${address.pincode}`,
    whatsappLink,
    qikinkPayload,
    qikinkStatus: qikinkLiveStatus,
    createdAt: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })
  };

  orders.push(newOrder);
  saveOrders(orders);

  res.json({
    success: true,
    orderId,
    total: totalAmount,
    whatsappLink,
    qikinkStatus: qikinkLiveStatus,
    message: `Order #${orderId} confirmed! Forwarded to TRIVÉ Printing & Packaging queue.`
  });
});

app.get('/api/orders', (req, res) => res.json({ brand: 'TRIVÉ', total: orders.length, orders: loadOrders() }));

app.listen(PORT, () => {
  console.log(`TRIVÉ Engine running on http://localhost:${PORT}`);
});
