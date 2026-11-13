const express = require('express');
const cors = require('cors');

const app = express();

// Middleware setup
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'online', service: 'TRIVÉ Atelier API Backend' });
});

// Unified Order Endpoint for Web & Telegram Bot
app.post('/api/orders', (req, res) => {
  try {
    const orderData = req.body;
    
    // Validate basic payload fields
    if (!orderData || !orderData.item || !orderData.phone) {
      return res.status(400).json({ success: false, message: 'Invalid order payload.' });
    }

    const trackingId = `TV-TG-${Math.floor(1000 + Math.random() * 9000)}`;
    
    console.log(`[UNIFIED STORE ORDER RECEIVED] ID: ${trackingId} | Source: ${orderData.source || 'Telegram'} | User: ${orderData.user} | Item: ${orderData.item} (${orderData.size}) | Phone: ${orderData.phone}`);

    return res.status(200).json({
      success: true,
      orderId: trackingId,
      message: 'Telegram order successfully synced to Render backend.'
    });

  } catch (error) {
    console.error('[UNIFIED ORDER ERROR]:', error);
    return res.status(500).json({ success: false, message: 'Server error processing order.' });
  }
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