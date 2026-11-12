const https = require('https');

// Qikink Sandbox API Endpoint & Test Payload
const data = JSON.stringify({
  order_number: "TRIVE-SANDBOX-01",
  shipping_address: {
    first_name: "Dev",
    last_name: "Verma",
    address1: "House No. 4, Balaji Dham 3",
    city: "Bhopal",
    province: "Madhya Pradesh",
    zip: "462044",
    country: "India",
    phone: "9977798829",
    email: "support@trive.in"
  },
  line_items: [
    {
      sku: "TEST-HOODIE-XL",
      quantity: 1,
      price: "1799"
    }
  ],
  payment_mode: "Prepaid",
  shipping: 0
});

// Qikink Sandbox URL (or replace with your integration method if using specific sandbox keys)
const options = {
  hostname: 'api.qikink.com', // or sandbox url if provided by qikink docs
  port: 443,
  path: '/api/v1/orders/create', // standard qikink endpoint
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    // 'Authorization': 'Bearer YOUR_SANDBOX_API_KEY' if required by your setup
  }
};

console.log("Dispatching sandbox order to Qikink...");
const req = https.request(options, (res) => {
  let resData = '';
  res.on('data', chunk => resData += chunk);
  res.on('end', () => {
    console.log("QIKINK SANDBOX RESPONSE:", resData);
  });
});

req.on('error', (err) => {
  console.log("Request error:", err.message);
});

req.write(data);
req.end();
