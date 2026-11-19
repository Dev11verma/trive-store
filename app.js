// ==========================================
// TRIVE // ARCHIVAL HEAVYWEAR - CORE STORE ENGINE
// ==========================================

let activeGender = 'all';
let activeCategory = 'all';
let currentProduct = typeof PRODUCTS !== 'undefined' ? PRODUCTS[0] : null;
let selectedColor = currentProduct ? currentProduct.colors[0] : null;
let selectedSize = 'L';
let cart = [];
try {
  const savedCart = localStorage.getItem('trive_cart');
  if (savedCart) cart = JSON.parse(savedCart);
} catch (e) {
  cart = [];
}
const RENDER_BACKEND_URL = 'https://trive-store.onrender.com'; // <-- Paste your exact Render URL here
let API_URL = `${RENDER_BACKEND_URL}/api/order`;
if (window.location.hostname.includes('onrender.com') || window.location.hostname === 'trivestore.in') {
  API_URL = '/api/order';
}

// ==========================================
// 1. CATALOG RENDERING & FILTERING
// ==========================================

function renderCatalog() {
  let grid = document.getElementById('products-grid');
  if (!grid) grid = document.getElementById('product-grid');
  if (!grid) return;
  if (typeof PRODUCTS === 'undefined') return;

  const filtered = PRODUCTS.filter((p) => {
    const pGender = (p.gender ? p.gender : 'unisex').toLowerCase();
    const pCat = (p.category ? p.category : 'hoodie').toLowerCase();

    const genderMatch =
      activeGender === 'all' ? true : (pGender === activeGender ? true : pGender === 'unisex');

    const categoryMatch =
      activeCategory === 'all' ? true : pCat === activeCategory;

    return genderMatch && categoryMatch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#888;border:1px dashed #222;border-radius:12px;">
        No archival pieces match this filter yet.
      </div>`;
    return;
  }

  grid.innerHTML = filtered
    .map((product) => {
      const primaryColor = product.colors[0];
      const frontImg = primaryColor.images[0];
      const backImg = primaryColor.images[1] ? primaryColor.images[1] : frontImg;
      const tagText = product.tag ? product.tag : '';
      const isComingSoon = tagText.toLowerCase().includes('coming soon');
      const discountPct = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

      const swatchesHtml = product.colors
        .map(
          (c, idx) => `
          <span 
            title="${c.name}" 
            onclick="event.stopPropagation(); swapCardColor('${product.id}', ${idx})"
            style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${c.hex};border:1px solid #444;cursor:pointer;">
          </span>`
        )
        .join('');

      const btnAction = isComingSoon
        ? `openProduct('${product.id}')`
        : `quickAddToCart('${product.id}')`;

      return `
        <div class="product-card" onclick="openProduct('${product.id}')" style="background:#0c0c0e;border:1px solid #1e1e22;border-radius:12px;overflow:hidden;cursor:pointer;display:flex;flex-direction:column;justify-content:space-between;transition:transform 0.2s ease, border-color 0.2s ease;">
          <div>
            <div style="position:relative;background:#08080a;aspect-ratio:4/5;overflow:hidden;">
              <img 
                id="card-img-${product.id}" 
                src="${frontImg}" 
                data-front="${frontImg}" 
                data-back="${backImg}"
                onmouseover="this.src=this.dataset.back"
                onmouseout="this.src=this.dataset.front"
                alt="${product.name}" 
                style="width:100%;height:100%;object-fit:cover;transition:transform 0.3s ease;"
              />
              ${
                tagText
                  ? `<span style="position:absolute;top:12px;left:12px;background:${
                      isComingSoon ? '#18181b' : '#d7ff3e'
                    };color:${
                      isComingSoon ? '#a1a1aa' : '#050505'
                    };font-size:10px;font-weight:900;padding:4px 8px;border-radius:4px;letter-spacing:0.08em;text-transform:uppercase;">${tagText}</span>`
                  : ''
              }
            </div>
            <div style="padding:16px;">
              <div style="display:flex;gap:6px;margin-bottom:10px;">${swatchesHtml}</div>
              <h3 style="font-size:15px;font-weight:800;color:#fff;margin:0 0 8px;line-height:1.3;">${product.name}</h3>
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:16px;font-weight:900;color:#fff;">₹${product.price.toLocaleString('en-IN')}</span>
                ${
                  product.originalPrice
                    ? `<span style="font-size:13px;color:#666;text-decoration:line-through;">₹${product.originalPrice.toLocaleString('en-IN')}</span>`
                    : ''
                }
                ${
                  discountPct > 0
                    ? `<span style="font-size:11px;font-weight:800;color:#22c55e;">${discountPct}% OFF</span>`
                    : ''
                }
              </div>
            </div>
          </div>
          <div style="padding:0 16px 16px;">
            <button 
              type="button"
              onclick="event.stopPropagation(); ${btnAction}"
              style="width:100%;padding:10px;background:${
                isComingSoon ? '#18181b' : '#ffffff'
              };color:${
                isComingSoon ? '#71717a' : '#050505'
              };border:1px solid ${
                isComingSoon ? '#27272a' : '#ffffff'
              };border-radius:6px;font-size:11px;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;">
              ${isComingSoon ? 'NOTIFY // DROP 03' : '+ ADD TO BAG'}
            </button>
          </div>
        </div>
      `;
    })
    .join('');
}

function swapCardColor(productId, colorIdx) {
  const product = PRODUCTS.find((p) => p.id === productId);
  const imgEl = document.getElementById(`card-img-${productId}`);
  if (!product) return;
  if (!imgEl) return;

  const chosen = product.colors[colorIdx];
  imgEl.src = chosen.images[0];
  imgEl.dataset.front = chosen.images[0];
  imgEl.dataset.back = chosen.images[1] ? chosen.images[1] : chosen.images[0];
}

function setGenderFilter(gender, btnEl) {
  activeGender = gender;
  document.querySelectorAll('.gender-tab').forEach((b) => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  renderCatalog();
}

function setCategoryFilter(category, btnEl) {
  activeCategory = category;
  document.querySelectorAll('.pill').forEach((b) => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  renderCatalog();
}

// ==========================================
// 2. PRODUCT DETAIL VIEW (#view-product)
// ==========================================

function openProduct(productId) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;

  currentProduct = product;
  selectedColor = product.colors[0];
  selectedSize = 'L';

  const tagEl = document.getElementById('detail-tag');
  const titleEl = document.getElementById('detail-title');
  const priceEl = document.getElementById('detail-price');
  const descEl = document.getElementById('detail-desc');
  const mainImgEl = document.getElementById('detail-main-img');

  if (tagEl) tagEl.textContent = product.tag ? product.tag : 'ARCHIVAL DROP';
  if (titleEl) titleEl.textContent = product.name;
  if (priceEl) priceEl.textContent = `₹${product.price.toLocaleString('en-IN')}`;
  if (descEl) descEl.textContent = product.desc ? product.desc : '';
  if (mainImgEl && selectedColor && selectedColor.images[0]) {
    mainImgEl.src = selectedColor.images[0];
  }

  renderDetailThumbnails();
  renderColorPicker();
  syncSizeButtons();
  switchView('view-product');
}

function renderDetailThumbnails() {
  const thumbsEl = document.getElementById('detail-thumbs');
  if (!thumbsEl) return;
  if (!selectedColor) return;

  thumbsEl.innerHTML = selectedColor.images
    .map(
      (imgSrc, idx) => `
      <img 
        src="${imgSrc}" 
        alt="View ${idx + 1}" 
        onclick="selectDetailThumb('${imgSrc}', this)"
        style="width:72px;height:86px;object-fit:cover;border-radius:6px;cursor:pointer;border:1px solid ${idx === 0 ? '#d7ff3e' : '#26262b'};"
      />`
    )
    .join('');
}

function selectDetailThumb(imgSrc, el) {
  const mainImgEl = document.getElementById('detail-main-img');
  if (mainImgEl) mainImgEl.src = imgSrc;
  document.querySelectorAll('#detail-thumbs img').forEach((img) => {
    img.style.borderColor = '#26262b';
  });
  if (el) el.style.borderColor = '#d7ff3e';
}

function renderColorPicker() {
  const pickerEl = document.getElementById('color-picker');
  if (!pickerEl) return;
  if (!currentProduct) return;

  pickerEl.innerHTML = currentProduct.colors
    .map((c, idx) => {
      const isActive = selectedColor && selectedColor.name === c.name;
      return `
        <button 
          type="button" 
          class="color-chip ${isActive ? 'active' : ''}" 
          onclick="selectProductColor(${idx}, this)">
          <span class="color-dot" style="background:${c.hex};"></span>${c.name}
        </button>`;
    })
    .join('');
}

function selectProductColor(idx, el) {
  if (!currentProduct) return;
  selectedColor = currentProduct.colors[idx];
  document.querySelectorAll('#color-picker .color-chip').forEach((chip) => chip.classList.remove('active'));
  if (el) el.classList.add('active');

  const mainImgEl = document.getElementById('detail-main-img');
  if (mainImgEl && selectedColor && selectedColor.images[0]) {
    mainImgEl.src = selectedColor.images[0];
  }
  renderDetailThumbnails();
}

function selectSize(sz, el) {
  selectedSize = sz;
  document.querySelectorAll('#size-options .size-btn').forEach((btn) => btn.classList.remove('active'));
  if (el) el.classList.add('active');
}

function syncSizeButtons() {
  document.querySelectorAll('#size-options .size-btn').forEach((btn) => {
    if (btn.textContent.trim() === selectedSize) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function addToCartCurrentProduct() {
  if (!currentProduct) return;
  const colorObj = selectedColor ? selectedColor : currentProduct.colors[0];
  addItemToCart({
    id: currentProduct.id,
    sku: currentProduct.sku ? currentProduct.sku : currentProduct.id.toUpperCase(),
    name: currentProduct.name,
    price: currentProduct.price,
    color: colorObj.name,
    size: selectedSize,
    image: colorObj.images[0],
    quantity: 1
  });
  toggleCart(true);
}

// ==========================================
// 3. CART DRAWER & ITEM MANAGEMENT
// ==========================================

function quickAddToCart(productId) {
  const p = PRODUCTS.find((item) => item.id === productId);
  if (!p) return;
  addItemToCart({
    id: p.id,
    sku: p.sku ? p.sku : p.id.toUpperCase(),
    name: p.name,
    price: p.price,
    color: p.colors[0].name,
    size: 'L',
    image: p.colors[0].images[0],
    quantity: 1
  });
  toggleCart(true);
}

function addItemToCart(item) {
  const existing = cart.find(
    (c) => c.id === item.id && c.color === item.color && c.size === item.size
  );
  if (existing) {
    existing.quantity += item.quantity ? item.quantity : 1;
  } else {
    cart.push(item);
  }
  saveAndRenderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveAndRenderCart();
}

function updateItemQty(index, delta) {
  if (!cart[index]) return;
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  saveAndRenderCart();
}

function saveAndRenderCart() {
  localStorage.setItem('trive_cart', JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = totalCount;
  document.querySelectorAll('.cart-count').forEach((el) => (el.textContent = totalCount));

  let itemsContainer = document.getElementById('cart-items-list');
  if (!itemsContainer) itemsContainer = document.getElementById('cart-items');

  if (itemsContainer) {
    if (cart.length === 0) {
      itemsContainer.innerHTML = `<div style="text-align:center;color:#666;padding:40px 10px;font-size:13px;">Your archival bag is empty.</div>`;
    } else {
      itemsContainer.innerHTML = cart
        .map(
          (item, i) => `
          <div style="display:flex;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid #1f1f23;">
            <img src="${item.image}" alt="${item.name}" style="width:56px;height:68px;object-fit:cover;border-radius:6px;background:#111;">
            <div style="flex:1;">
              <div style="font-size:13px;font-weight:800;color:#fff;">${item.name}</div>
              <div style="font-size:11px;color:#888;margin:2px 0 6px;">${item.color} • Size ${item.size}</div>
              <div style="display:flex;align-items:center;gap:8px;">
                <button type="button" onclick="updateItemQty(${i}, -1)" style="width:22px;height:22px;background:#18181b;color:#fff;border:1px solid #333;border-radius:4px;cursor:pointer;">-</button>
                <span style="font-size:12px;font-weight:700;color:#fff;">${item.quantity}</span>
                <button type="button" onclick="updateItemQty(${i}, 1)" style="width:22px;height:22px;background:#18181b;color:#fff;border:1px solid #333;border-radius:4px;cursor:pointer;">+</button>
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:13px;font-weight:800;color:#fff;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</div>
              <button type="button" onclick="removeFromCart(${i})" style="background:none;border:none;color:#ef4444;font-size:11px;cursor:pointer;margin-top:6px;">Remove</button>
            </div>
          </div>`
        )
        .join('');
    }
  }

  let totalEl = document.getElementById('drawer-total');
  if (!totalEl) totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;

  updateCheckoutSummary();
}

function toggleCart(forceOpen) {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (!drawer) return;

  const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !drawer.classList.contains('open');
  if (shouldOpen) {
    updateCartUI();
    drawer.classList.add('open');
    drawer.style.right = '0';
    if (overlay) overlay.classList.add('active');
  } else {
    drawer.classList.remove('open');
    drawer.style.right = '-420px';
    if (overlay) overlay.classList.remove('active');
  }
}

// ==========================================
// 4. VIEW SWITCHING, CHECKOUT & PAYMENT FLOW
// ==========================================

function switchView(viewId) {
  document.querySelectorAll('.view').forEach((v) => {
    v.classList.remove('active');
    v.style.display = 'none';
  });
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add('active');
    target.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function navigateTo(viewName) {
  if (viewName === 'catalog') switchView('view-catalog');
  else if (viewName === 'checkout') proceedToCheckoutFromCart();
  else if (viewName === 'payment') goToPayment();
  else if (viewName === 'success') switchView('view-success');
  else switchView(`view-${viewName}`);
}

function showCatalog() {
  switchView('view-catalog');
}

function proceedToCheckoutFromCart() {
  if (cart.length === 0) {
    alert('Your bag is empty. Add an archival piece first!');
    return;
  }
  toggleCart(false);
  updateCheckoutSummary();
  switchView('view-checkout');
}

function proceedToCheckout() {
  proceedToCheckoutFromCart();
}

function applyCoupon() {
  const input = document.getElementById('coupon-code');
  const couponRow = document.getElementById('coupon-row');
  const discEl = document.getElementById('sum-discount');
  if (!input) return;

  const code = input.value.trim().toUpperCase();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (code === 'FIRSTDROP') {
    discountAmount = Math.round(subtotal * 0.15);
  } else if (code === 'TRIVE10') {
    discountAmount = Math.round(subtotal * 0.1);
  } else if (code === 'VIP200') {
    discountAmount = 200;
  } else {
    discountAmount = 0;
    alert('Invalid promo code. Try FIRSTDROP or TRIVE10.');
  }

  if (couponRow) {
    couponRow.style.display = discountAmount > 0 ? 'flex' : 'none';
  }
  if (discEl) {
    discEl.textContent = `-₹${discountAmount.toLocaleString('en-IN')}`;
  }
  updateCheckoutSummary();
}

function updateCheckoutSummary() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const codFee = selectedPaymentMode === 'COD' ? 99 : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount + codFee);

  const subEl = document.getElementById('sum-subtotal');
  const discEl = document.getElementById('sum-discount');
  const couponRow = document.getElementById('coupon-row');
  const totEl = document.getElementById('sum-total');

  if (subEl) subEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  if (discEl) discEl.textContent = `-₹${discountAmount.toLocaleString('en-IN')}`;
  if (couponRow) couponRow.style.display = discountAmount > 0 ? 'flex' : 'none';
  if (totEl) totEl.textContent = `₹${finalTotal.toLocaleString('en-IN')}`;
}

function goToPayment() {
  const name = (document.getElementById('cust-name')?.value || '').trim();
  const phone = (document.getElementById('cust-phone')?.value || '').trim();
  const street = (document.getElementById('cust-street')?.value || '').trim();
  const city = (document.getElementById('cust-city')?.value || '').trim();
  const pin = (document.getElementById('cust-pin')?.value || '').trim();

  if (!name || !phone || !street || !city || !pin) {
    alert('Please fill in Name, Mobile Number, Street Address, City, and PIN Code first.');
    return;
  }

  updateCheckoutSummary();
  switchView('view-payment');
}

function selectPaymentMode(mode) {
  selectedPaymentMode = mode;

  const optUpi = document.getElementById('opt-upi');
  const optCod = document.getElementById('opt-cod');
  const upiBox = document.getElementById('upi-box');

  if (optUpi) {
    if (mode === 'UPI') optUpi.classList.add('selected');
    else optUpi.classList.remove('selected');
  }
  if (optCod) {
    if (mode === 'COD') optCod.classList.add('selected');
    else optCod.classList.remove('selected');
  }
  if (upiBox) {
    upiBox.style.display = mode === 'UPI' ? 'block' : 'none';
  }
  updateCheckoutSummary();
}

function openModal(modalId) {
  const backdrop = document.getElementById('modal-backdrop');
  const modal = document.getElementById(modalId);
  if (backdrop) backdrop.style.display = 'block';
  if (modal) modal.style.display = 'block';
}

function closeAllModals() {
  const backdrop = document.getElementById('modal-backdrop');
  if (backdrop) backdrop.style.display = 'none';
  document.querySelectorAll('.trive-modal').forEach((m) => (m.style.display = 'none'));
}

// ==========================================
// 5. ORDER DISPATCH TO EXPRESS BACKEND (PORT 8080)
// ==========================================

async function dispatchOrder() {
  const name = (document.getElementById('cust-name')?.value || '').trim();
  const phone = (document.getElementById('cust-phone')?.value || '').trim();
  const street = (document.getElementById('cust-street')?.value || '').trim();
  const city = (document.getElementById('cust-city')?.value || '').trim();
  const pin = (document.getElementById('cust-pin')?.value || '').trim();
  const utr = (document.getElementById('pay-utr')?.value || '').trim();

  if (!name || !phone || !street || !city || !pin) {
    alert('Please complete your shipping details before placing the order.');
    switchView('view-checkout');
    return;
  }

  if (selectedPaymentMode === 'UPI' && utr.length < 10) {
    alert('Please enter your valid 12-digit UPI Transaction ID / UTR.');
    return;
  }

  const submitBtn = document.getElementById('btn-submit-order');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'DISPATCHING ARCHIVAL ORDER...';
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const codFee = selectedPaymentMode === 'COD' ? 99 : 0;
  const totalAmount = Math.max(0, subtotal - discountAmount + codFee);
  const primaryItem = cart[0] || {
    sku: 'TRV-ARCHIVAL',
    color: 'Standard',
    size: 'L'
  };

  const orderPayload = {
    customer: { name, phone, email: 'support.trive@gmail.com' },
    product: {
      name: cart.map((i) => `${i.name} (${i.color}/${i.size}) x${i.quantity}`).join(', '),
      sku: primaryItem.sku,
      price: totalAmount
    },
    items: cart,
    color: primaryItem.color,
    size: primaryItem.size,
    quantity: cart.reduce((s, i) => s + i.quantity, 0),
    utr: selectedPaymentMode === 'UPI' ? utr : 'COD_ORDER',
    paymentMode: selectedPaymentMode,
    address: { street, city, state: 'Madhya Pradesh', pincode: pin }
  };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });

    const data = await res.json();

    if (res.ok && data.success) {
      const orderId = data.orderId ? data.orderId : `TRV-${Date.now().toString().slice(-6)}`;

      const confirmedIdEl = document.getElementById('confirmed-id');
      const confirmedAddrEl = document.getElementById('confirmed-address');
      const waBtn = document.getElementById('btn-wa-confirm');

      if (confirmedIdEl) confirmedIdEl.textContent = `#${orderId}`;
      if (confirmedAddrEl) confirmedAddrEl.textContent = `${street}, ${city} - ${pin}`;
      if (waBtn) {
        const waText = encodeURIComponent(
          `TRIVÉ Order Confirmed! ID: #${orderId} | Name: ${name} | Total: ₹${totalAmount} | Mode: ${selectedPaymentMode}`
        );
        waBtn.href = `https://wa.me/919202142350?text=${waText}`;
      }

      cart = [];
      discountAmount = 0;
      saveAndRenderCart();
      switchView('view-success');
    } else {
      throw new Error(data.message ? data.message : 'Server error while processing order.');
    }
  } catch (err) {
    console.error('[TRIVE Order Dispatch Error]:', err);
    alert(`Order dispatch failed: ${err.message}. Check that the Node backend is running on port 8080.`);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm & Place Order';
    }
  }
}

// ==========================================
// 6. DEAL OF THE DAY COUNTDOWN TIMER
// ==========================================

function startDealTimer() {
  const timerEl = document.getElementById('countdown-timer');
  if (!timerEl) return;

  let secondsLeft = 4 * 3600 + 22 * 60 + 15;
  setInterval(() => {
    if (secondsLeft <= 0) secondsLeft = 4 * 3600;
    secondsLeft--;
    const hrs = String(Math.floor(secondsLeft / 3600)).padStart(2, '0');
    const mins = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
    const secs = String(secondsLeft % 60).padStart(2, '0');
    timerEl.textContent = `ENDS IN ${hrs}:${mins}:${secs}`;
  }, 1000);
}