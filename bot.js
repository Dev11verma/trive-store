const { Telegraf, Markup } = require('telegraf');

// Initialize bot with your Telegram token (Regenerate a fresh token via @BotFather after testing)
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '9234651103:AAGBmV8-rDbKecvvFXB8Pr0pRX-qFMxSESI';
const bot = new Telegraf(BOT_TOKEN);

// In-memory session store for active user orders
const userSessions = {};

// Live Store & Backend API URLs
const LIVE_STORE_URL = 'https://trivestore.in';
const PORT = process.env.PORT || 8080;
const BACKEND_API_URL = process.env.RENDER_EXTERNAL_URL
  ? `${process.env.RENDER_EXTERNAL_URL}/api/order`
  : `http://localhost:${PORT}/api/order`;

// Full TRIVÉ Active Catalog & Coming Soon Drops
const PRODUCTS = [
  { id: 'deal-01', name: "You Can't Please Everyone // Acid Wash Hoodie", price: 1799, sku: 'TRV-HD-01', category: 'Hoodie' },
  { id: 'biker-hoodie-01', name: 'Hypersport Biker Riding Hoodie', price: 2199, sku: 'TRV-HD-02', category: 'Hoodie' },
  { id: 'tee-drop-02', name: 'Lost But Never Broken // Oversized Tee', price: 1199, sku: 'TRV-TEE-02', category: 'T-Shirt' },
  { id: 'tee-01', name: 'Born to Reign // Legacy Edition Tee', price: 1299, sku: 'TRV-TEE-01', category: 'T-Shirt' },
  { id: 'lower-01', name: 'Heavy Terry Archival Joggers', price: 1699, sku: 'TRV-LOW-01', category: 'Jogger' },
  { id: 'drop-porsche-01', name: 'Need Money For Porsche // Heavy Hoodie', price: 2299, sku: 'TRV-DROP3-01', category: 'Drop 03' },
  { id: 'drop-boss-02', name: 'Success & Power // Heavyweight Hoodie', price: 2299, sku: 'TRV-DROP3-02', category: 'Drop 03' },
  { id: 'drop-spider-03', name: 'Miles Morales Archival // Hoodie', price: 2399, sku: 'TRV-DROP3-03', category: 'Drop 03' },
  { id: 'drop-crosshair-04', name: 'Crosshair Underground // Heavy Hoodie', price: 2199, sku: 'TRV-DROP3-04', category: 'Drop 03' }
];

// /start command
bot.start((ctx) => {
  ctx.reply(
    `🔥 *Welcome to TRIVÉ Atelier Telegram Concierge*.\n\n` +
    `Streamlined heavywear. Oversized tees, heavy joggers, and archival hoodies.\n\n` +
    `Explore our live store archive or place an order directly right here in chat:`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.url('🌐 Visit Live Store', LIVE_STORE_URL)],
        [Markup.button.callback('🛍️ View Catalog & Order', 'view_catalog')],
        [Markup.button.callback('📦 Track My Order', 'track_order')]
      ])
    }
  );
});

// View Catalog action
bot.action('view_catalog', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `🗂️ *TRIVÉ ACTIVE CATALOG & DROPS*\nSelect an item to begin your order:`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          ...PRODUCTS.map((p) => [Markup.button.callback(`${p.name} (₹${p.price})`, `select_prod_${p.id}`)]),
          [Markup.button.callback('« Back to Main Menu', 'main_menu')]
        ])
      }
    );
  } catch (e) {
    console.error(e);
  }
});

// Handle product selection
bot.action(/select_prod_(.+)/, async (ctx) => {
  const prodId = ctx.match[1];
  const product = PRODUCTS.find((p) => p.id === prodId);
  if (!product) return ctx.answerCbQuery('Product not found.');

  userSessions[ctx.from.id] = { selectedProduct: product };

  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `Selected: *${product.name}*\nPrice: *₹${product.price}*\n\nSelect your size:`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        ['S', 'M', 'L', 'XL', 'XXL'].map((size) => Markup.button.callback(size, `size_${size}`)),
        [Markup.button.callback('« Back to Catalog', 'view_catalog')]
      ])
    }
  );
});

// Handle size selection
bot.action(/size_(.+)/, async (ctx) => {
  const size = ctx.match[1];
  if (!userSessions[ctx.from.id]) userSessions[ctx.from.id] = {};
  userSessions[ctx.from.id].size = size;

  try {
    await ctx.answerCbQuery();
  } catch (err) {
    // Ignore expired callback query
  }

  try {
    await ctx.editMessageText(`Size selected: *${size}*`, { parse_mode: 'Markdown' });
  } catch (e) {
    // Ignore minor edit conflicts
  }

  await ctx.reply(
    `Please share your *delivery phone number* using the button below or type it directly in chat:`,
    {
      parse_mode: 'Markdown',
      ...Markup.keyboard([Markup.button.contactRequest('📱 Share Phone Number')]).resize().oneTime()
    }
  );
});

// Capture phone number from contact button share
bot.on('contact', async (ctx) => {
  const phone = ctx.message.contact.phone_number;
  if (!userSessions[ctx.from.id]) userSessions[ctx.from.id] = {};
  userSessions[ctx.from.id].phone = phone;

  await ctx.reply(
    `Got your number! 📲\n\nFinally, please reply with your *full delivery address* (House/Street, City, Pincode):`,
    { parse_mode: 'Markdown', ...Markup.removeKeyboard() }
  );
});

// Capture text input for phone number or address
bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const session = userSessions[userId];

  if (!session || !session.size) return;

  if (!session.phone) {
    session.phone = ctx.message.text.trim();
    return ctx.reply(
      `Got your number! 📲\n\nFinally, please reply with your *full delivery address* (House/Street, City, Pincode):`,
      { parse_mode: 'Markdown', ...Markup.removeKeyboard() }
    );
  }

  if (session.phone && !session.address) {
    session.address = ctx.message.text.trim();
    const customerName = `${ctx.from.first_name || 'Telegram'} ${ctx.from.last_name || ''}`.trim();

    const orderPayload = {
      customer: {
        name: `${customerName} (@${ctx.from.username || 'telegram'})`,
        phone: session.phone,
        email: 'support.trive@gmail.com'
      },
      product: {
        name: session.selectedProduct.name,
        sku: session.selectedProduct.sku || 'TRV-TG',
        price: session.selectedProduct.price
      },
      items: [
        {
          name: session.selectedProduct.name,
          sku: session.selectedProduct.sku || 'TRV-TG',
          color: 'Standard',
          size: session.size,
          quantity: 1,
          price: session.selectedProduct.price
        }
      ],
      color: 'Standard',
      size: session.size,
      quantity: 1,
      utr: 'TELEGRAM_BOT_ORDER',
      paymentMode: 'TELEGRAM // COD-UPI',
      address: {
        street: session.address,
        city: 'Telegram Concierge',
        state: 'India',
        pincode: ''
      }
    };

    let orderId = `TV-${Date.now().toString().slice(-6)}`;

    try {
      const response = await fetch(BACKEND_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const result = await response.json();
      if (result.orderId) orderId = result.orderId;
      console.log('Synced Telegram order to backend & email:', result);
    } catch (err) {
      console.error('Failed to sync Telegram order:', err.message);
    }

    const orderSummary =
      `🎉 *ORDER PLACED SUCCESSFULLY!*\n\n` +
      `🆔 *Order ID:* #${orderId}\n` +
      `🛍️ *Item:* ${session.selectedProduct.name}\n` +
      `📏 *Size:* ${session.size}\n` +
      `💰 *Price:* ₹${session.selectedProduct.price}\n` +
      `📱 *Phone:* ${session.phone}\n` +
      `📍 *Address:* ${session.address}\n\n` +
      `Our concierge team has received your order email and will verify dispatch shortly!`;

    await ctx.reply(orderSummary, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.url('🌐 Visit Store', LIVE_STORE_URL)],
        [Markup.button.callback('🛍️ Place Another Order', 'view_catalog')]
      ])
    });

    delete userSessions[userId];
  }
});

// Main menu navigation action
bot.action('main_menu', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `🔥 *TRIVÉ Atelier Telegram Concierge*\nChoose an option:`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.url('🌐 Visit Live Store', LIVE_STORE_URL)],
          [Markup.button.callback('🛍️ View Catalog & Order', 'view_catalog')],
          [Markup.button.callback('📦 Track My Order', 'track_order')]
        ])
      }
    );
  } catch (e) {
    console.error(e);
  }
});

bot.catch((err) => {
  console.error('[TRIVÉ Bot Runtime Error]:', err.message || err);
});

bot.launch()
  .then(() => {
    console.log('🤖 TRIVÉ Platinum Telegram Ordering Bot is live and running!');
  })
  .catch((err) => {
    console.error('[TRIVÉ Bot Launch Conflict/Error]:', err.message || err);
  });

bot.action('track_order', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(`📦 All recent drops are shipped via express courier within 48 hours. Drop your Order ID (#TV-XXXXXX) here for status inquiries.`);
});

bot.launch().then(() => {
  console.log('🤖 TRIVÉ Platinum Telegram Ordering Bot is live and running!');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));