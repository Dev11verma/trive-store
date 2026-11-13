const { Telegraf, Markup } = require('telegraf');

// Initialize bot with your live Telegram token
const bot = new Telegraf('9234651103:AAGBmV8-rDbKecvvFXB8Pr0pRX-qFMxSESI');

// In-memory session store for active user orders
const userSessions = {};

// Backend API URL (Change to your Render URL once deployed, e.g., 'https://trive-store.onrender.com/api/orders')
const BACKEND_API_URL = 'https://trive-api.onrender.com/api/orders';

// Full TRIVÉ Active Catalog & Coming Soon Drops
const PRODUCTS = [
  { id: 'deal-01', name: "You Can't Please Everyone // Acid Wash Hoodie", price: 1799, category: 'Hoodie' },
  { id: 'biker-hoodie-01', name: 'Hypersport Biker Riding Hoodie', price: 2199, category: 'Hoodie' },
  { id: 'tee-drop-02', name: 'Lost But Never Broken // Oversized Tee', price: 1199, category: 'T-Shirt' },
  { id: 'tee-01', name: 'BORN TO RULE Tee', price: 1299, category: 'T-Shirt' },
  { id: 'lower-01', name: 'Heavy Terry Archival Joggers', price: 1699, category: 'Jogger' },
  { id: 'drop-porsche-01', name: 'Need Money For Porsche // Heavy Hoodie', price: 2299, category: 'Drop 03' },
  { id: 'drop-boss-02', name: 'Success & Power // Heavyweight Hoodie', price: 2299, category: 'Drop 03' },
  { id: 'drop-spider-03', name: 'Miles Morales Archival // Hoodie', price: 2399, category: 'Drop 03' },
  { id: 'drop-crosshair-04', name: 'Crosshair Underground // Heavy Hoodie', price: 2199, category: 'Drop 03' }
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
        [Markup.button.url('🌐 Visit Live Store', 'https://dev11verma.github.io/trive-store/')],
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
          ...PRODUCTS.map(p => [Markup.button.callback(`${p.name} (₹${p.price})`, `select_prod_${p.id}`)]),
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
  const product = PRODUCTS.find(p => p.id === prodId);
  if (!product) return ctx.answerCbQuery('Product not found.');

  userSessions[ctx.from.id] = { selectedProduct: product };

  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `Selected: *${product.name}*\nPrice: *₹${product.price}*\n\n` +
    `Select your size:`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        ['S', 'M', 'L', 'XL', 'XXL'].map(size => Markup.button.callback(size, `size_${size}`)),
        [Markup.button.callback('« Back to Catalog', 'view_catalog')]
      ])
    }
  );
});

// Handle size selection (Bulletproofed against query timeouts)
bot.action(/size_(.+)/, async (ctx) => {
  const size = ctx.match[1];
  if (!userSessions[ctx.from.id]) userSessions[ctx.from.id] = {};
  userSessions[ctx.from.id].size = size;

  try {
    await ctx.answerCbQuery();
  } catch (err) {
    console.log('Note: Callback query already expired, proceeding with flow.');
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
      ...Markup.keyboard([
        Markup.button.contactRequest('📱 Share Phone Number')
      ]).resize().oneTime()
    }
  );
});

// Capture phone number from contact button share
bot.on('contact', async (ctx) => {
  const phone = ctx.message.contact.phone_number;
  if (!userSessions[ctx.from.id]) userSessions[ctx.from.id] = {};
  userSessions[ctx.from.id].phone = phone;

  await ctx.reply(
    `Got your number! 📲\n\n` +
    `Finally, please reply with your *full delivery address* (City, Pincode, House/Street):`,
    { parse_mode: 'Markdown', ...Markup.removeKeyboard() }
  );
});

// Capture text input for phone number (if typed manually) or address
bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const session = userSessions[userId];

  if (!session || !session.size) return; // Ignore unstructured text messages outside active flow

  // If phone is missing, treat text as manual phone input
  if (!session.phone) {
    session.phone = ctx.message.text;
    return ctx.reply(
      `Got your number! 📲\n\n` +
      `Finally, please reply with your *full delivery address* (City, Pincode, House/Street):`,
      { parse_mode: 'Markdown', ...Markup.removeKeyboard() }
    );
  }

  // If phone is present but address is missing, treat text as address and finalize order
  if (session.phone && !session.address) {
    session.address = ctx.message.text;

    const orderPayload = {
      source: 'Telegram Bot',
      user: ctx.from.username || ctx.from.first_name,
      userId: ctx.from.id,
      item: session.selectedProduct.name,
      price: session.selectedProduct.price,
      size: session.size,
      phone: session.phone,
      address: session.address,
      timestamp: new Date().toISOString()
    };

    // Forward order to backend server
    try {
      const response = await fetch(BACKEND_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const result = await response.json();
      console.log('Synced order to backend server:', result);
    } catch (err) {
      console.error('Failed to sync order to backend server:', err.message);
    }

    const orderSummary = 
      `🎉 *ORDER PLACED SUCCESSFULLY!*\n\n` +
      `🛍️ *Item:* ${session.selectedProduct.name}\n` +
      `📏 *Size:* ${session.size}\n` +
      `💰 *Price:* ₹${session.selectedProduct.price}\n` +
      `📱 *Phone:* ${session.phone}\n` +
      `📍 *Address:* ${session.address}\n\n` +
      `Our concierge team will verify your drop order shortly. Thank you for shopping TRIVÉ!`;

    await ctx.reply(orderSummary, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.url('🌐 Visit Store', 'https://dev11verma.github.io/trive-store/')],
        [Markup.button.callback('🛍️ Place Another Order', 'view_catalog')]
      ])
    });

    // Clear session
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
          [Markup.button.url('🌐 Visit Live Store', 'https://dev11verma.github.io/trive-store/')],
          [Markup.button.callback('🛍️ View Catalog & Order', 'view_catalog')],
          [Markup.button.callback('📦 Track My Order', 'track_order')]
        ])
      }
    );
  } catch (e) {
    console.error(e);
  }
});

bot.action('track_order', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(`📦 All recent drops are shipped via express courier within 48 hours. Drop your Order ID or username here for status inquiries.`);
});

// Launch bot with logging
bot.launch().then(() => {
  console.log('TRIVÉ Platinum Telegram Ordering Bot is live and running!');
});

// Graceful termination handlers
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));