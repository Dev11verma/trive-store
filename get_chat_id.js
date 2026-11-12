const https = require('https');
const token = '9234651103:AAGBmV8-rDbKecvvFXB8Pr0pRX-qFMxSESI';
const url = `https://api.telegram.org/bot${token}/getUpdates`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log("RESPONSE:", data);
    try {
      const json = JSON.parse(data);
      if (json.result && json.result.length > 0) {
        const chatId = json.result[0].message.chat.id;
        console.log("\n================================");
        console.log(" YOUR TELEGRAM CHAT ID IS: " + chatId);
        console.log("================================\n");
      } else {
        console.log("\n[!] No messages found yet. Make sure you sent 'Test' or '/start' to t.me/triveorderbot on Telegram first!");
      }
    } catch(e) {
      console.log("Error parsing JSON");
    }
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
