const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const https = require('https');

const app = express();
app.use(express.json());
app.use(cors());

const ORDERS_FILE = path.join(__dirname, 'orders.json');

// Telegram Configuration
const TG_TOKEN = '9234651103:AAGBmV8-rDbKecvvFXB8Pr0pRX-qFMxSESI';
const TG_CHAT_ID = '1167472555';

function sendTelegramAlert(order) {
  const lineItemsStr = order.line_items ? order.line_items.map(i => `${i.name} (Qty: ${i.quantity})`).join(', ') : 'N/A';
  const addr = order.shipping_address || {};
  
  const message = `🚨 NEW TRIVÉ ORDER PLACED! 🚨\n\n` +
    `📦 Order ID: ${order.order_number}\n` +
    `👤 Customer: ${addr.first_name || ''} ${addr.last_name || ''}\n` +
    `📞 Phone: ${addr.phone || 'N/A'}\n` +
    `📍 Address: ${addr.address1 || ''}, ${addr.city || ''}, ${addr.province || ''} - ${addr.zip || ''}\n` +
    `🛍️ Items: ${lineItemsStr}\n` +
    `💰 Total: ₹${order.total_price || order.total_order_value || '1799'}\n` +
    `💳 Payment: ${order.gateway || 'COD'}`;

  const data = JSON.stringify({
    chat_id: TG_CHAT_ID,
    text: message
  });

  const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${TG_TOKEN}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = https.request(options, (res) => {
    let resData = '';
    res.on('data', chunk => resData += chunk);
    res.on('end', () => console.log('Telegram alert response:', resData));
  });

  req.on('error', error => console.error('Telegram alert error:', error));
  req.write(data);
  req.end();
}

// Status endpoint
app.get('/', (req, res) => {
  let activeCount = 0;
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
      activeCount = Array.isArray(orders) ? orders.length : 0;
    }
  } catch(e) {}

  res.json({
    brand: "TRIVÉ",
    architecture: "Custom Cloud Storefront + TRIVÉ Engine + Qikink Gateway",
    activeOrders: activeCount,
    status: "Operational"
  });
});

// Place Order endpoint
app.post('/api/orders', (req, res) => {
  try {
    const orderData = req.body;
    let orders = [];
    if (fs.existsSync(ORDERS_FILE)) {
      orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
    }

    // Assign unique incremental tracking ID if missing
    if (!orderData.order_number) {
      orderData.order_number = "TRIVE-" + Math.floor(1000 + Math.random() * 9000);
    }
    orderData.created_at = new Date().toISOString();
    orderData.status = "Pending Review";

    orders.unshift(orderData);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));

    // Fire instant Telegram push alert to your phone
    sendTelegramAlert(orderData);

    res.json({
      success: true,
      order_number: orderData.order_number,
      message: "Order placed successfully and alert dispatched!"
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Orders list endpoint
app.get('/api/admin/orders', (req, res) => {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
      return res.json(orders);
    }
    res.json([]);
  } catch (e) {
    res.json([]);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`TRIVÉ Backend Engine running on port ${PORT}`);
});
