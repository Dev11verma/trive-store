const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "TRIOX backend is running" });
});

app.post("/api/lead", (req, res) => {
  const { email, name, source } = req.body || {};

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Valid email required" });
  }

  console.log("NEW TRIOX LEAD:");
  console.log({ email, name, source, date: new Date().toISOString() });

  res.json({
    success: true,
    message: "You are on the TRIOX list. Drop updates incoming."
  });
});

app.post("/api/shopify-order", (req, res) => {
  const order = req.body || {};

  console.log("NEW SHOPIFY ORDER:");
  console.log({
    orderId: order.id,
    customer: order.email,
    total: order.total_price,
    items: order.line_items?.map(item => item.title)
  });

  res.json({ received: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`TRIOX backend running: http://localhost:${PORT}`);
});
