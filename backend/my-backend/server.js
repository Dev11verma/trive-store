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

// Qikink Auth Gateway
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

// Admin Command Center with Accept/Reject controls
app.get('/admin', (req, res) => {
  orders = loadOrders();
  const orderCards = orders.slice().reverse().map(o => {
    const isAccepted = o.acceptanceStatus === 'ACCEPTED';
    const isRejected = o.acceptanceStatus === 'REJECTED';

    const statusBadge = isAccepted
      ? `<span style="background:#22c55e22;color:#22c55e;padding:3px 8px;border-radius:4px;font-size:11px;font-weight:700;">APPROVED & DISPATCHED</span>`
      : isRejected
      ? `<span style="background:#ef444422;color:#ef4444;padding:3px 8px;border-radius:4px;font-size:11px;font-weight:700;">DECLINED</span>`
      : `<span style="background:#f59e0b22;color:#f59e0b;padding:3px 8px;border-radius:4px;font-size:11px;font-weight:700;">PENDING YOUR APPROVAL</span>`;

    return `
      <div style="background:#141414;border:1px solid #2a2a2a;border-radius:12px;padding:20px;margin-bottom:16px;color:#eee;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-weight:900;color:#d7ff3e;font-size:17px;">#${o.orderId}</span>
            ${statusBadge}
          </div>
          <span style="font-size:12px;color:#888;">${o.createdAt}</span>
        </div>
        <div style="font-size:15px;font-weight:bold;margin-bottom:4px;">${o.product}</div>
        <div style="font-size:13px;color:#d7ff3e;margin-bottom:8px;">
          <strong>Color:</strong> ${o.color} &bull; <strong>Size:</strong> ${o.size} &bull; <strong>Qty:</strong> ${o.quantity}
        </div>
        <div style="color:#aaa;font-size:13px;line-height:1.6;margin-bottom:12px;">
          <strong>Customer:</strong> ${o.customer} (<a href="tel:${o.phone}" style="color:#d7ff3e;">${o.phone}</a>)<br>
          <strong>Address:</strong> ${o.address}<br>
          <strong>Payment:</strong> ₹${o.total.toLocaleString('en-IN')} &bull; ${o.paymentStatus}<br>
          <strong>Qikink Status:</strong> <span style="color:#38bdf8;">${o.qikinkStatus || 'Awaiting Review'}</span>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;border-top:1px solid #222;padding-top:12px;">
          ${!isAccepted ? `
            <button onclick="updateOrderStatus('${o.orderId}', 'ACCEPTED')" style="background:#d7ff3e;color:#000;border:none;padding:8px 16px;border-radius:6px;font-size:12px;font-weight:bold;cursor:pointer;">
              ✓ Accept Order
            </button>
          ` : ''}
          ${!isRejected ? `
            <button onclick="updateOrderStatus('${o.orderId}', 'REJECTED')" style="background:#222;color:#ef4444;border:1px solid #444;padding:8px 14px;border-radius:6px;font-size:12px;cursor:pointer;">
              ✕ Reject
            </button>
          ` : ''}
          <a href="${o.whatsappLink}" target="_blank" style="background:#25D366;color:#000;text-decoration:none;padding:8px 14px;border-radius:6px;font-size:12px;font-weight:bold;text-transform:uppercase;">
            📲 WhatsApp
          </a>
          <button onclick="navigator.clipboard.writeText(decodeURIComponent('${encodeURIComponent(JSON.stringify(o.qikinkPayload))}')); alert('Qikink payload copied!');" style="background:#1a1a1a;color:#fff;border:1px solid #333;padding:8px 14px;border-radius:6px;font-size:12px;cursor:pointer;">
            📋 Copy Payload
          </button>
        </div>
      </div>
    `;
  }).join('');

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
          <div class="sub">Total Orders Logged: ${orders.length} (Persistent Storage)</div>
          ${orders.length ? orderCards : '<div style="color:#555;padding:40px 0;text-align:center;">No orders yet. Place an order from your storefront.</div>'}
        </div>
        <script>
          async function updateOrderStatus(orderId, status) {
            try {
              const res = await fetch('/api/order/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status })
              });
              if (res.ok) window.location.reload();
            } catch (e) {
              alert('Failed to update status');
            }
          }
        </script>
      </body>
    </html>
  `);
});

// Endpoint to update order review state
app.post('/api/order/status', (req, res) => {
  const { orderId, status } = req.body || {};
  orders = loadOrders();
  const order = orders.find(o => o.orderId === orderId);
  if (order) {
    order.acceptanceStatus = status;
    saveOrders(orders);
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'Order not found' });
});

app.post('/api/order', async (req, res) => {
  const { customer, product, size, color, quantity, utr, address } = req.body || {};

  if (!customer?.name || !customer?.phone || !address?.city) {
    return res.status(400).json({ error: 'Customer name, phone, and address are required.' });
  }

  orders = loadOrders();
  const orderId = `TV-${1000 + orders.length + 1}`;
  
  let unitPrice = Number(product?.price) || 1799;
  if (unitPrice > 10000) unitPrice = Math.round(unitPrice / 100);

  const qty = parseInt(quantity, 10) || 1;
  const totalAmount = unitPrice;
  const garmentColor = color || 'Washed Mineral Grey';
  const cleanPhone = customer.phone.replace(/[^0-9]/g, '').slice(-10);

  const waMsg = encodeURIComponent(
    `*TRIVÉ // ORDER CONFIRMED [${orderId}]*\n\n` +
    `Hey ${customer.name},\n` +
    `Your order for *${product?.name || "You Can't Please Everyone // Acid Wash Hoodie"}* has been received:\n\n` +
    `• *Colorway:* ${garmentColor}\n` +
    `• *Size:* ${size || 'L'}\n` +
    `• *Quantity:* ${qty}\n\n` +
    `📦 *Delivery Destination:* ${address.city}, ${address.pincode}\n` +
    `💰 *Total Amount:* ₹${totalAmount.toLocaleString('en-IN')}\n` +
    `⚡ *Status:* Reviewing order in TRIVÉ Command Center.\n\n` +
    `_TRIVÉ Heavywear — Lost But Never Broken._`
  );
  const whatsappLink = `https://wa.me/91${cleanPhone}?text=${waMsg}`;

  const isCod = utr?.toUpperCase() === 'COD';

  // Strict Qikink V2 Specification: province and country_code only
  const qikinkPayload = {
    order_number: orderId,
    qikink_shipping: "1",
    gateway: isCod ? "COD" : "Prepaid",
    total_order_value: String(totalAmount),
    shipping_address: {
      first_name: customer.name.split(' ')[0],
      last_name: customer.name.split(' ').slice(1).join(' ') || 'Customer',
      address1: address.street,
      address2: "",
      phone: cleanPhone,
      email: customer.email || "support@trive.in",
      city: address.city,
      zip: String(address.pincode),
      province: address.state || "Madhya Pradesh",
      country_code: "IN"
    },
    line_items: [
      {
        search_from_my_products: 1,
        sku: `UH62-${(size || 'L').toUpperCase()}`,
        quantity: String(qty),
        price: String(unitPrice)
      }
    ]
  };

  let qikinkLiveStatus = 'Queued';
  try {
    const auth = await getQikinkAuth();
    if (auth?.token) {
      const qikinkRes = await fetch(`${auth.baseUrl}/api/order/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ClientId': QIKINK_CLIENT_ID,
          'Accesstoken': auth.token
        },
        body: JSON.stringify(qikinkPayload)
      });
      const qikinkData = await qikinkRes.json();
      console.log('Qikink Response:', qikinkData);

      if (qikinkData?.error) {
        qikinkLiveStatus = `Qikink: ${qikinkData.error}`;
      } else if (qikinkData?.errors || qikinkData?.message) {
        qikinkLiveStatus = qikinkData.message || JSON.stringify(qikinkData.errors);
      } else {
        qikinkLiveStatus = qikinkData?.status || `Sent (${auth.baseUrl.includes('sandbox') ? 'Sandbox' : 'Live'})`;
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
    product: product?.name || "You Can't Please Everyone // Acid Wash Hoodie",
    color: garmentColor,
    size: size || 'L',
    quantity: qty,
    total: totalAmount,
    paymentStatus: isCod ? 'Pending (COD)' : `Prepaid (UTR: ${utr})`,
    customer: customer.name,
    phone: customer.phone,
    address: `${address.street}, ${address.city}, ${address.state || 'Madhya Pradesh'} - ${address.pincode}`,
    whatsappLink,
    qikinkPayload,
    qikinkStatus: qikinkLiveStatus,
    acceptanceStatus: 'PENDING',
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
    message: `Order #${orderId} logged successfully into TRIVÉ Command Center.`
  });
});

app.get('/api/orders', (req, res) => res.json({ brand: 'TRIVÉ', total: orders.length, orders: loadOrders() }));

app.listen(PORT, () => {
  console.log(`TRIVÉ Engine running on http://localhost:${PORT}`);
});
