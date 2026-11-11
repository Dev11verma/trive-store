import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const orders = [];

app.get('/', (req, res) => {
  res.json({
    brand: 'TRIVÉ',
    architecture: 'Shopify Storefront + Custom Node Engine + Qikink Fulfillment',
    activeOrders: orders.length
  });
});

app.post('/api/order', (req, res) => {
  const { customer, product, size, quantity, utr, address } = req.body || {};

  if (!customer?.name || !customer?.phone || !address?.city) {
    return res.status(400).json({ error: 'Customer name, phone, and address are required.' });
  }

  const orderId = `TV-${1000 + orders.length + 1}`;
  
  // Clean Shopify paise pricing (e.g., 199900 -> 1999)
  let unitPrice = Number(product?.price) || 1299;
  if (unitPrice > 10000) {
    unitPrice = Math.round(unitPrice / 100);
  }

  const qty = parseInt(quantity, 10) || 1;
  const totalAmount = unitPrice * qty;
  const isHoodie = (product?.name || '').toLowerCase().includes('hoodie');

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
    address: `${address.street}, ${address.city}, ${address.state} - ${address.pincode}`,
    qikinkManifest: {
      factoryRoute: 'Tirupur DTG Printing Line',
      neckLabel: 'Applied (TRIVÉ Custom Neck Print)',
      hangTag: 'Applied (Drop 01 Compass Tag)',
      insertCard: 'Inserted (TRIVÉ Archival Note)',
      packaging: isHoodie ? 'Rigid Kraft Box' : 'White-Label Heavy Poly-Mailer',
      senderBranding: 'TRIVÉ Streetwear // Bhopal, MP'
    },
    status: 'Confirmed // Ready for Qikink Dispatch',
    createdAt: new Date().toLocaleTimeString('en-IN')
  };

  orders.push(newOrder);

  console.log('\n==========================================================');
  console.log(`📦 INCOMING SHOPIFY STOREFRONT ORDER: #${orderId}`);
  console.log('==========================================================');
  console.log(`CUSTOMER:   ${newOrder.customer} | ${newOrder.phone}`);
  console.log(`DELIVERY:   ${newOrder.address}`);
  console.log(`GARMENT:    ${newOrder.product} [${newOrder.size}] x ${newOrder.quantity}`);
  console.log(`PAYMENT:    ₹${newOrder.total.toLocaleString('en-IN')} (Unit: ₹${newOrder.unitPrice}) | ${newOrder.paymentStatus}`);
  console.log('--- QIKINK FULFILLMENT SPECIFICATIONS ---');
  console.log(`✔ Neck Label:    ${newOrder.qikinkManifest.neckLabel}`);
  console.log(`✔ Hang Tag:      ${newOrder.qikinkManifest.hangTag}`);
  console.log(`✔ Packaging:     ${newOrder.qikinkManifest.packaging}`);
  console.log(`✔ Sender Label:  ${newOrder.qikinkManifest.senderBranding}`);
  console.log('==========================================================\n');

  res.json({
    success: true,
    orderId,
    total: totalAmount,
    message: `Order #${orderId} confirmed! Forwarded to TRIVÉ production queue.`
  });
});

app.get('/api/orders', (req, res) => res.json({ brand: 'TRIVÉ', total: orders.length, orders }));

app.listen(PORT, () => {
  console.log(`TRIVÉ Engine running on http://localhost:${PORT}`);
});
