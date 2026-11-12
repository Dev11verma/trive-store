const https = require('https');
const token = '9234651103:AAGBmV8-rDbKecvvFXB8Pr0pRX-qFMxSESI';
const chatId = '1167472555';
const message = '🚨 TEST PING FROM TRIVÉ BACKEND!';

const data = JSON.stringify({
  chat_id: chatId,
  text: message,
  parse_mode: 'Markdown'
});

const options = {
  hostname: 'api.telegram.org',
  port: 443,
  path: `/bot${token}/sendMessage`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let resData = '';
  res.on('data', chunk => resData += chunk);
  res.on('end', () => {
    console.log("TELEGRAM API RESPONSE:", resData);
  });
});

req.on('error', (err) => {
  console.log("REQUEST ERROR:", err.message);
});

req.write(data);
req.end();
