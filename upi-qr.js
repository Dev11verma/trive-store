(function () {
  const TRIVE_UPI_ID = window.TRIVE_UPI_ID || 'Dev11verma@ybl';
  const TRIVE_MERCHANT_NAME = window.TRIVE_MERCHANT_NAME || 'TRIVE';
  const FALLBACK_STATIC_QR = '/assets/Main/qr.jpeg';

  function loadQrLib(callback, onError) {
    if (window.QRCode) return callback();
    const existing = document.querySelector('script[data-trive-qr="1"]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    script.setAttribute('data-trive-qr', '1');
    script.onload = callback;
    script.onerror = onError || function () {};
    document.head.appendChild(script);
  }

  function resolveContainer(containerId) {
    if (containerId && document.getElementById(containerId)) {
      return document.getElementById(containerId);
    }
    return document.querySelector('#upi-box .upi-qr-box') || document.querySelector('.upi-qr-box');
  }

  window.renderInstantUpiQr = function (opts) {
    const {
      containerId = 'trive-upi-qr-box',
      amount = 0,
      orderNote = 'TRIVE Order'
    } = opts || {};

    const cleanAmount = Number(String(amount).replace(/[^0-9.]/g, '')) || 0;
    const formattedAmount = cleanAmount.toFixed(2);
    const container = resolveContainer(containerId);
    if (!container) return;

    if (cleanAmount <= 0) {
      container.innerHTML = '<p style="color:#a1a1aa;font-size:13px;">Add an item to generate payment QR.</p>';
      return;
    }

    const upiUrl =
      `upi://pay?pa=${encodeURIComponent(TRIVE_UPI_ID)}` +
      `&pn=${encodeURIComponent(TRIVE_MERCHANT_NAME)}` +
      `&am=${encodeURIComponent(formattedAmount)}` +
      `&cu=INR` +
      `&tn=${encodeURIComponent(orderNote)}`;

    const canvasId = `trive-qr-canvas-${Date.now()}`;

    container.innerHTML = `
      <div style="background:#111114;border:1px solid #27272a;border-radius:12px;padding:16px;text-align:center;max-width:290px;margin:10px auto;">
        <div style="font-size:11px;letter-spacing:1.4px;color:#d7ff3e;font-weight:700;margin-bottom:4px;">
          INSTANT UPI QR // EXACT AMOUNT
        </div>
        <div style="font-size:22px;font-weight:800;color:#ffffff;margin-bottom:10px;">
          ₹${cleanAmount.toLocaleString('en-IN')}
        </div>
        <div id="${canvasId}" style="background:#ffffff;padding:10px;border-radius:10px;display:inline-block;margin-bottom:10px;"></div>
        <div style="font-size:12px;color:#a1a1aa;margin-bottom:10px;">
          Scan with GPay, PhonePe, Paytm or any UPI App<br/>
          <span style="color:#e4e4e7;font-family:monospace;">${TRIVE_UPI_ID}</span>
        </div>
        <a href="${upiUrl}" style="display:inline-block;background:#d7ff3e;color:#09090b;font-weight:700;font-size:12px;padding:9px 16px;border-radius:6px;text-decoration:none;letter-spacing:0.5px;">
          PAY ₹${cleanAmount.toLocaleString('en-IN')} IN UPI APP
        </a>
      </div>
    `;

    loadQrLib(
      function () {
        const target = document.getElementById(canvasId);
        if (!target) return;
        target.innerHTML = '';
        new window.QRCode(target, {
          text: upiUrl,
          width: 180,
          height: 180,
          colorDark: '#09090b',
          colorLight: '#ffffff',
          correctLevel: window.QRCode.CorrectLevel.M
        });
      },
      function () {
        const target = document.getElementById(canvasId);
        if (target) {
          target.innerHTML = `<img src="${FALLBACK_STATIC_QR}" alt="TRIVÉ UPI QR" style="width:180px;height:180px;object-fit:contain;" />`;
        }
      }
    );
  };
})();
