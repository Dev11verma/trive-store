import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory ledger (resets on restart; you can connect MongoDB/Supabase later)
const orders = [];

app.get('/', (req, res) => {
  res.json({
    brand: 'TRIVÉ',
    architecture: 'Shopify/GitHub Storefront + Custom Cloud Engine + Qikink Fulfillment',
    activeOrders: orders.length,
    status: 'Operational'
  });
});

// SECRET ADMIN DASHBOARD FOR YOUR PHONE: https://trive-api.onrender.com/admin
app.get('/admin', (req, res) => {
  const orderCards = orders.slice().reverse().map(o => `
    <div style="background:#141414;border:1px solid #2a2a2a;border-radius:12px;padding:18px;margin-bottom:14px;color:#eee;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <span style="font-weight:900;color:#d7ff3e;font-size:16px;">#${o.orderId}</span>
        <span style="font-size:12px;color:#888;">${o.createdAt}</span>
      </div>
      <div style="font-size:15px;font-weight:bold;margin-bottom:4px;">${o.product} [${o.size}] x ${o.quantity}</div>
      <div style="color:#aaa;font-size:13px;margin-bottom:8px;">
        <strong>Customer:</strong> ${o.customer} (<a href="tel:${o.phone}" style="color:#d7ff3e;">${o.phone}</a>)<br>
        <strong>Address:</strong> ${o.address}<br>
        <strong>Payment:</strong> ₹${o.total.toLocaleString('en-IN')} &bull; ${o.paymentStatus}
      </div>
      <div style="margin-top:10px;display:flex;gap:10px;flex-wrap:wrap;">
        <a href="${o.whatsappLink}" target="_blank" style="background:#25D366;color:#000;text-decoration:none;padding:8px 14px;border-radius:6px;font-size:12px;font-weight:bold;text-transform:uppercase;">
          📲 WhatsApp Customer
        </a>
        <button onclick="navigator.clipboard.writeText('${encodeURIComponent(JSON.stringify(o.qikinkPayload))}'); alert('Qikink JSON payload copied!');" style="background:#222;color:#fff;border:1px solid #444;padding:8px 14px;border-radius:6px;font-size:12px;cursor:pointer;">
          📋 Copy Qikink Payload
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
          <div class="sub">Total Orders Received: ${orders.length}</div>
          ${orders.length ? orderCards : '<div style="color:#555;padding:40px 0;text-align:center;">No orders yet. Place a test order from your storefront.</div>'}
        </div>
      </body>
    </html>
  `);
});

app.post('/api/order', (req, res) => {
  const { customer, product, size, quantity, utr, address } = req.body || {};

  if (!customer?.name || !customer?.phone || !address?.city) {
    return res.status(400).json({ error: 'Customer name, phone, and address are required.' });
  }

  const orderId = `TV-${1000 + orders.length + 1}`;
  
  // Normalize paise values
  let unitPrice = Number(product?.price) || 1299;
  if (unitPrice > 10000) {
    unitPrice = Math.round(unitPrice / 100);
  }

  const qty = parseInt(quantity, 10) || 1;
  const totalAmount = unitPrice * qty;
  const isHoodie = (product?.name || '').toLowerCase().includes('hoodie');

  // WhatsApp click-to-chat URL with branded message
  const cleanPhone = customer.phone.replace(/[^0-9]/g, '').slice(-10);
  const waMsg = encodeURIComponent(
    `*TRIVÉ // ORDER CONFIRMED [${orderId}]*\n\n` +
    `Hey ${customer.name},\n` +
    `Your order for *${product?.name || 'TRIVÉ Drop 01'}* (Size: ${size || 'L'}, Qty: ${qty}) has been logged into the TRIVÉ archival dispatch queue.\n\n` +
    `📦 *Delivery Destination:* ${address.city}, ${address.pincode}\n` +
    `💰 *Total Amount:* ₹${totalAmount.toLocaleString('en-IN')}\n` +
    `⚡ *Status:* Moving to Tirupur Printing & Packaging.\n\n` +
    `We will send your tracking link as soon as it leaves the facility.\n` +
    `_TRIVÉ Heavywear — Lost But Never Broken._`
  );
  const whatsappLink = `https://wa.me/91${cleanPhone}?text=${waMsg}`;

  // Structured Qikink API Order Payload ready for Tirupur fulfillment
  const qikinkPayload = {
    order_number: orderId,
    order_type: utr?.toUpperCase() === 'COD' ? 'cod' : 'prepaid',
    order_total: totalAmount,
    first_name: customer.name.split(' ')[0],
    last_name: customer.name.split(' ').slice(1).join(' ') || 'Customer',
    phone: cleanPhone,
    address1: address.street,
    city: address.city,
    state: address.state || 'Madhya Pradesh',
    pincode: address.pincode,
    country: 'India',
    line_items: [
      {
        search_from: 'sku',
        sku: isHoodie ? `TRV-HD-01-${size || 'L'}` : `TRV-TEE-01-${size || 'L'}`,
        quantity: qty,
        price: unitPrice
      }
    ],
    branding: {
      neck_label: true,
      hang_tag: true,
      custom_packaging: isHoodie ? 'rigid_kraft_box' : 'poly_mailer'
    }
  };

  const newOrder = {
    orderId,
    brand: 'TRIVÉ',
    product: product?.name || 'TRIVÉ Drop 01 Garment',
    color: product?.color || 'Archival Shade',
    size: size || 'L',
    quantity: qty,
    unitPrice: unitPrice,
    total: totalAmount,
    paymentStatus: utr?.toUpperCase() === 'COD' ? 'Pending (COD)' : `Prepaid (UTR: ${utr})`,
    customer: customer.name,
    phone: customer.phone,
    address: `${address.street}, ${address.city}, ${address.state || 'Madhya Pradesh'} - ${address.pincode}`,
    whatsappLink,
    qikinkPayload,
    status: 'Confirmed // Ready for Qikink Dispatch',
    createdAt: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })
  };

  orders.push(newOrder);

  console.log('\n==========================================================');
  console.log(`📦 INCOMING TRIVÉ ORDER: #${orderId}`);
  console.log('==========================================================');
  console.log(`CUSTOMER:   ${newOrder.customer} | ${newOrder.phone}`);
  console.log(`DELIVERY:   ${newOrder.address}`);
  console.log(`GARMENT:    ${newOrder.product} [${newOrder.size}] x ${newOrder.quantity}`);
  console.log(`PAYMENT:    ₹${newOrder.total.toLocaleString('en-IN')} | ${newOrder.paymentStatus}`);
  console.log(`WHATSAPP:   ${whatsappLink}`);
  console.log('--- QIKINK FULFILLMENT PAYLOAD READY ---');
  console.log(JSON.stringify(qikinkPayload, null, 2));
  console.log('==========================================================\n');

  res.json({
    success: true,
    orderId,
    total: totalAmount,
    whatsappLink,
    message: `Order #${orderId} confirmed! Forwarded to TRIVÉ production queue.`
  });
});

app.get('/api/orders', (req, res) => res.json({ brand: 'TRIVÉ', total: orders.length, orders }));

app.listen(PORT, () => {
  console.log(`TRIVÉ Engine running on http://localhost:${PORT}`);
});
