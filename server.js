const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(cors());

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '9234651103:AAGBmV8-rDbKecvvFXB8Pr0pRX-qFMxSESI';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '1167472555';

app.get('/', (req, res) => {
  res.send('TRIVE API Backend is running 24/7.');
});

app.post('/api/order', async (req, res) => {
  try {
    const orderData = req.body;
    const orderId = 'TV-' + Math.floor(1000 + Math.random() * 9000);

    // Format message for Telegram
    const message = *TRIVÉ // ORDER CONFIRMED []*\n\n +
      Hey Dev Verma,\n +
      Your order for ** has been received:\n\n +
      - *Colorway:* \n +
      - *Size:* \n +
      - *Quantity:* \n\n +
      📍 *Delivery Destination:* , \n +
      💰 *Total Amount:* ₹\n +
      📋 *Status:* Reviewing order in TRIVÉ Command Center.\n\n +
      _TRIVÉ Heavywear — BORN TO RULE._;

    // Send Telegram Notification
    await fetch(https://api.telegram.org/bot/sendMessage, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    // Qikink Payload Structure with Correct Product SKU 65053748
    const qikinkPayload = {
      order_number: 'TRV' + Math.floor(10000000 + Math.random() * 90000000),
      qikink_shipping: '1',
      gateway: orderData.utr === 'COD' ? 'COD' : 'Prepaid',
      total_order_value: String(orderData.product.price),
      shipping_address: {
        first_name: orderData.customer.name.split(' ')[0],
        last_name: orderData.customer.name.split(' ').slice(1).join(' ') || 'Verma',
        address1: orderData.address.street,
        address2: '',
        phone: orderData.customer.phone,
        email: 'support@trive.in',
        city: orderData.address.city,
        zip: orderData.address.pincode,
        province: orderData.address.state || 'Madhya Pradesh',
        country_code: 'IN'
      },
      line_items: [
        {
          search_from_my_products: 1,
          sku: '65053748',
          quantity: String(orderData.quantity || 1),
          price: String(orderData.product.price)
        }
      ]
    };

    res.json({
      success: true,
      orderId: orderId,
      whatsappLink: https://wa.me/91?text=Hi%20,%20your%20TRIVÉ%20order%20%23%20has%20been%20dispatched!,
      qikinkPayload: qikinkPayload
    });

  } catch (err) {
    console.error('Order processing error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(Server running on port );
});
