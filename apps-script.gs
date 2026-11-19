function doPost(e) {
  var ss = SpreadsheetApp.openById("1MLLheo6Sz_2xPSSikNEKsR8KMCHMT0SB8LeHMZyYHg0");
  var sheet = ss.getActiveSheet();

  var orderId = "TV-" + Date.now().toString().slice(-6);
  var name = "Valued Customer";
  var phone = "N/A";
  var prodName = "TRIVÉ Garment";
  var price = "1299";
  var paymentId = "COD_ORDER";
  var paymentMode = "prepaid";
  var rawItems = [];

  var street = "";
  var city = "";
  var state = "";
  var pincode = "";

  try {
    if (e && e.postData && e.postData.contents) {
      var rawData = JSON.parse(e.postData.contents);
      if (rawData.orderId) orderId = String(rawData.orderId).replace(/^#/, "");
      if (rawData.customer) {
        name = rawData.customer.name || name;
        phone = rawData.customer.phone || phone;
      }
      if (rawData.product) {
        prodName = rawData.product.name || prodName;
        price = rawData.product.price || price;
      }
      if (Array.isArray(rawData.items) && rawData.items.length > 0) {
        rawItems = rawData.items;
      }
      if (rawData.payment) {
        paymentId = rawData.payment.paymentId || rawData.payment.razorpay_payment_id || paymentId;
      } else if (rawData.razorpay_payment_id) {
        paymentId = rawData.razorpay_payment_id;
      } else if (rawData.utr) {
        paymentId = rawData.utr;
      }
      if (String(paymentId).toUpperCase().indexOf("COD") !== -1 || String(rawData.paymentMode || "").toUpperCase() === "COD") {
        paymentMode = "cod";
      }
      if (rawData.address) {
        street = rawData.address.street || "";
        city = rawData.address.city || "";
        state = rawData.address.state || "";
        pincode = rawData.address.pincode || rawData.address.zip || "";
      }
    }
  } catch (err) {
    Logger.log("Payload Parse Warning: " + err.toString());
  }

  var fullAddress = street + (city ? ", " + city : "") + (state ? ", " + state : "") + (pincode ? " - " + pincode : "");
  if (fullAddress.trim() === "") fullAddress = "Address not provided";

  var istTimestamp = Utilities.formatDate(new Date(), "Asia/Kolkata", "dd/MM/yyyy, hh:mm:ss a");

  sheet.appendRow([orderId, name, phone, prodName, price, fullAddress, paymentId, istTimestamp]);

  var emailSent = false;
  try {
    var modeLabel = paymentMode === "cod" ? "COD" : "PAID / UPI";
    var emailSubject = "⚡ [NEW ORDER #" + orderId + "] ₹" + price + " • " + name + " (" + modeLabel + ")";
    var emailBody =
      "NEW TRIVÉ ARCHIVAL ORDER RECEIVED\n" +
      "====================================\n" +
      "Order ID: #" + orderId + "\n" +
      "Placed On: " + istTimestamp + " IST\n" +
      "Payment Ref / Mode: " + paymentId + "\n" +
      "Amount: ₹" + price + "\n\n" +
      "CUSTOMER & SHIPPING\n" +
      "------------------------------------\n" +
      "Name: " + name + "\n" +
      "Phone / WhatsApp: " + phone + "\n" +
      "Delivery Address: " + fullAddress + "\n\n" +
      "GARMENTS TO PRINT & DISPATCH\n" +
      "------------------------------------\n" +
      prodName + "\n\n" +
      "Sheet Updated: https://docs.google.com/spreadsheets/d/1MLLheo6Sz_2xPSSikNEKsR8KMCHMT0SB8LeHMZyYHg0\n";

    GmailApp.sendEmail("abhayvermasoni604@gmail.com,support.trive@gmail.com", emailSubject, emailBody);
    emailSent = true;
  } catch (mailErr) {
    Logger.log("GmailApp Error: " + mailErr.toString());
  }

  var qikinkStatus = "SKIPPED";
  try {
    qikinkStatus = sendOrderToQikink(orderId, name, phone, street, city, state, pincode, prodName, price, paymentMode, rawItems);
  } catch (qikErr) {
    qikinkStatus = "ERROR: " + qikErr.toString();
  }

  return ContentService.createTextOutput(
    JSON.stringify({ status: "success", orderId: orderId, emailSent: emailSent, qikinkStatus: qikinkStatus })
  ).setMimeType(ContentService.MimeType.JSON);
}

function mapProductToQikinkSku(itemName) {
  var lowerName = String(itemName || "").toLowerCase();
  if (lowerName.indexOf("spiritual") !== -1) return "65061774";
  if (lowerName.indexOf("parth") !== -1) return "65061750";
  if (lowerName.indexOf("karan arjun") !== -1) return "65061682";
  if (lowerName.indexOf("calm-a-sutra") !== -1) return "65061562";
  if (lowerName.indexOf("born to rule") !== -1) return "65056214";
  if (lowerName.indexOf("acid wash") !== -1 || lowerName.indexOf("please everyone") !== -1) return "65053748";
  if (lowerName.indexOf("trilayer") !== -1) return "65051598";
  return "65061644";
}

function sendOrderToQikink(orderId, name, phone, street, city, state, pincode, prodName, price, paymentMode, rawItems) {
  var props = PropertiesService.getScriptProperties();
  var clientId = props.getProperty("QIKINK_CLIENT_ID") || "YOUR_QIKINK_CLIENT_ID";
  var clientSecret = props.getProperty("QIKINK_CLIENT_SECRET") || "YOUR_QIKINK_CLIENT_SECRET";

  var authResponse = UrlFetchApp.fetch("https://api.qikink.com/api/v1/oauth/token", {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ client_id: clientId, client_secret: clientSecret }),
    muteHttpExceptions: true
  });
  var authResult = JSON.parse(authResponse.getContentText());
  var accessToken = authResult.access_token || authResult.token;
  if (!accessToken) throw new Error("Failed to authenticate with Qikink: " + authResponse.getContentText());

  var lineItems = [];
  if (Array.isArray(rawItems) && rawItems.length > 0) {
    for (var i = 0; i < rawItems.length; i++) {
      var it = rawItems[i];
      lineItems.push({
        sku: mapProductToQikinkSku(it.name || prodName),
        quantity: Number(it.quantity) || 1,
        price: Number(it.price) || Number(price) || 1299
      });
    }
  } else {
    lineItems.push({ sku: mapProductToQikinkSku(prodName), quantity: 1, price: Number(price) || 1299 });
  }

  var orderRes = UrlFetchApp.fetch("https://api.qikink.com/api/v1/orders", {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + accessToken },
    payload: JSON.stringify({
      order_id: orderId,
      payment_mode: paymentMode || "prepaid",
      total_amount: Number(price) || 1299,
      shipping_address: {
        name: name,
        phone: String(phone).replace(/^0+/, ""),
        address: street || "Main Street",
        city: city || "Bhopal",
        state: state || "Madhya Pradesh",
        pincode: String(pincode || "462044")
      },
      items: lineItems
    }),
    muteHttpExceptions: true
  });
  return "HTTP_" + orderRes.getResponseCode() + ": " + orderRes.getContentText().slice(0, 120);
}

function doGet(e) {
  return ContentService.createTextOutput("TRIVÉ Automated Backend & Qikink Connector is active.");
}
