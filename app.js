const UPI_SHIPPING_FEE = 0;
const UPI_PACKING_FEE = 0;
const COD_SHIPPING_FEE = 0;
const COD_PACKING_FEE = 0;
const COD_SURCHARGE = 149;

function calculateOrderCharges(subtotal, discount, paymentMode) {
  if (!cart || cart.length === 0 || subtotal <= 0) {
    return { shippingFee: 0, packingFee: 0, codFee: 0, totalAmount: 0 };
  }
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const isCod = paymentMode === 'COD';
  const shippingFee = isCod ? COD_SHIPPING_FEE : UPI_SHIPPING_FEE;
  const packingFee = isCod ? COD_PACKING_FEE : UPI_PACKING_FEE;
  const codFee = isCod ? COD_SURCHARGE : 0;
  const totalAmount = Math.max(0, discountedSubtotal + shippingFee + packingFee + codFee);
  return { shippingFee, packingFee, codFee, totalAmount };
}
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
let selectedPaymentMode = 'UPI';
let discountAmount = 0;

const RENDER_BACKEND_URL = 'https://trive-api.onrender.com';
let API_URL = `${RENDER_BACKEND_URL}/api/order`;
if (window.location.hostname.includes('onrender.com') || window.location.hostname === 'trivestore.in') {
  API_URL = '/api/order';
}

// ==========================================
// 1. CATALOG RENDERING & FILTERING
// ==========================================

function renderCatalog() {
  renderMarvelCollection();
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

function openCart() {
  toggleCart(true);
}

function closeCart() {
  toggleCart(false);
}

function toggleCart(forceOpen) {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (!drawer) return;

  const isCurrentlyOpen =
    drawer.classList.contains('open') || drawer.classList.contains('active');
  const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !isCurrentlyOpen;

  if (shouldOpen) {
    updateCartUI();
    drawer.classList.add('open', 'active');
    drawer.style.display = 'flex';
    drawer.style.right = '0px';
    drawer.style.transform = 'translateX(0)';
    if (overlay) {
      overlay.classList.add('open', 'active');
      overlay.style.display = 'block';
    }
  } else {
    drawer.classList.remove('open', 'active');
    drawer.style.right = '-420px';
    drawer.style.transform = 'translateX(100%)';
    if (overlay) {
      overlay.classList.remove('open', 'active');
      overlay.style.display = 'none';
    }
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

async function applyCoupon() {
  const input = document.getElementById('coupon-code');
  const couponRow = document.getElementById('coupon-row');
  const discEl = document.getElementById('sum-discount');
  if (!input) return;

  const code = input.value.trim().toUpperCase();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (code === 'FIRST50') {
    if (subtotal <= 1) {
      discountAmount = 0;
      alert('FIRST50 is valid on orders over ₹1.');
    } else {
      try {
        const baseApi = API_URL.replace(/\/api\/order$/, '');
        const res = await fetch(`${baseApi}/api/promo-status/FIRST50`);
        const info = await res.json();
        if (info && info.available === false) {
          discountAmount = 0;
          alert('FIRST50 limit (first 50 orders) has been reached! Use TRIVE10 for 10% off.');
        } else {
          discountAmount = Math.round(subtotal * 0.38);
        }
      } catch (e) {
        discountAmount = Math.round(subtotal * 0.38);
      }
    }
  } else if (code === 'TRIVE10') {
    discountAmount = Math.round(subtotal * 0.10);
  } else if (code === 'BUNDLE300') {
    const hoodieCount = cart
      .filter(i => `${i.name} ${i.sku} ${i.category || ''}`.toLowerCase().includes('hoodie'))
      .reduce((sum, i) => sum + i.quantity, 0);
    const teeItems = cart.filter(i => {
      const label = `${i.name} ${i.sku} ${i.category || ''}`.toLowerCase();
      return label.includes('tee') || label.includes('t-shirt') || label.includes('tshirt');
    });

    if (hoodieCount < 2) {
      discountAmount = 0;
      alert('BUNDLE300 requires 2 or more hoodies in your cart to get 1 T-Shirt FREE.');
    } else if (teeItems.length === 0) {
      discountAmount = 0;
      alert('2+ hoodies detected! Add any T-Shirt to your cart and tap Apply again to make it FREE.');
    } else {
      const freeTeePrice = Math.min(...teeItems.map(t => Number(t.price) || 0));
      discountAmount = freeTeePrice;
    }
  } else {
    discountAmount = 0;
    alert('Invalid promo code. Try FIRST50, TRIVE10, or BUNDLE300.');
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
  const { shippingFee, packingFee, codFee, totalAmount: finalTotal } = calculateOrderCharges(subtotal, discountAmount, selectedPaymentMode);

  const subEl = document.getElementById('sum-subtotal');
  const discEl = document.getElementById('sum-discount');
  const couponRow = document.getElementById('coupon-row');
  const totEl = document.getElementById('sum-total');

  if (subEl) subEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  if (discEl) discEl.textContent = `-₹${discountAmount.toLocaleString('en-IN')}`;
  if (couponRow) couponRow.style.display = discountAmount > 0 ? 'flex' : 'none';
  if (totEl) totEl.textContent = `₹${finalTotal.toLocaleString('en-IN')}`;
  if (selectedPaymentMode === 'UPI' && typeof window.renderInstantUpiQr === 'function') {
    window.renderInstantUpiQr({ amount: finalTotal, orderNote: 'TRIVE Archival Order', onPaymentSuccess: () => { if (typeof dispatchOrder === 'function') dispatchOrder(); } });
  }
}

function goToPayment() {
  const name = (document.getElementById('cust-name')?.value || '').trim();
  const phone = (document.getElementById('cust-phone')?.value || '').trim();
  const email = (document.getElementById('cust-email')?.value || '').trim() || 'support.trive@gmail.com';
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
// 5. ORDER DISPATCH TO EXPRESS BACKEND
// ==========================================

async function dispatchOrder() {
  const name = (document.getElementById('cust-name')?.value || '').trim();
  const phone = (document.getElementById('cust-phone')?.value || '').trim();
  const email = (document.getElementById('cust-email')?.value || '').trim() || 'support.trive@gmail.com';
  const street = (document.getElementById('cust-street')?.value || '').trim();
  const city = (document.getElementById('cust-city')?.value || '').trim();
  const pin = (document.getElementById('cust-pin')?.value || '').trim();
  const utr = window.__TRIVE_ACTIVE_UPI_REF__ || 'AUTO_UPI_CONFIRMED';

  if (!name || !phone || !street || !city || !pin) {
    alert('Please complete your shipping details before placing the order.');
    switchView('view-checkout');
    return;
  }

  

  const submitBtn = document.getElementById('btn-submit-order');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'DISPATCHING ARCHIVAL ORDER...';
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const { shippingFee, packingFee, codFee, totalAmount } = calculateOrderCharges(subtotal, discountAmount, selectedPaymentMode);
  const primaryItem = cart[0] || {
    sku: 'TRV-ARCHIVAL',
    color: 'Standard',
    size: 'L'
  };

  const orderPayload = {
    customer: { name, phone, email },
    product: {
      name: cart.map((i) => `${i.name} (${i.color}/${i.size}) x${i.quantity}`).join(', '),
      sku: primaryItem.sku,
      price: totalAmount
    },
    items: cart,
    color: primaryItem.color,
    size: primaryItem.size,
    quantity: cart.reduce((s, i) => s + i.quantity, 0),
    utr: selectedPaymentMode === 'UPI' ? (window.__TRIVE_ACTIVE_UPI_REF__ || utr || 'AUTO_UPI_CONFIRMED') : 'COD_ORDER',
    paymentMode: selectedPaymentMode,
    deliveryWay: selectedPaymentMode === 'UPI' ? 'UPI Prepaid' : 'Cash on Delivery (COD - ₹149 Fee)',
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
      if (typeof gtag === 'function') gtag('event', 'purchase', { transaction_id: data.orderId || ('TV-' + Date.now()), value: totalAmount, currency: 'INR' });
      switchView('view-success');
    } else {
      throw new Error(data.message ? data.message : 'Server error while processing order.');
    }
  } catch (err) {
    console.error('[TRIVE Order Dispatch Error]:', err);
    alert(`Order dispatch failed: ${err.message}`);
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







function renderMarvelCollection() {
  const mGrid = document.getElementById('marvel-collection-grid');
  const mCount = document.getElementById('marvel-collection-count');
  if (!mGrid || typeof PRODUCTS === 'undefined') return;

  const marvelItems = PRODUCTS.filter((p) => {
    const hay = `${p.id || ''} ${p.name || ''} ${p.sku || ''} ${p.tag || ''} ${p.desc || ''}`.toLowerCase();
    return hay.includes('marvel') || hay.includes('doomsday') || hay.includes('spidey') || hay.includes('spider-man') || hay.includes('deadpool');
  });

  if (mCount) {
    mCount.textContent = `${marvelItems.length} Archival Pieces`;
  }

  if (marvelItems.length === 0) {
    mGrid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:32px;color:#888;">Marvel pieces coming soon.</div>`;
    return;
  }

  mGrid.innerHTML = marvelItems.map((product) => {
    const primaryColor = product.colors && product.colors[0] ? product.colors[0] : { name: 'Default', hex: '#18181b', images: [''] };
    const mainImg = primaryColor.images && primaryColor.images[0] ? primaryColor.images[0] : '';
    const altImg = primaryColor.images && primaryColor.images[1] ? primaryColor.images[1] : mainImg;
    const discountPct = product.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

    const swatches = (product.colors || []).slice(0, 8).map((c, idx) =>
      `<button type="button" title="${c.name}" onclick="event.stopPropagation(); swapCardColor('${product.id}', ${idx}); const mImg = document.getElementById('marvel-card-img-${product.id}'); if (mImg && PRODUCTS) { const prod = PRODUCTS.find(x => x.id === '${product.id}'); if (prod && prod.colors[${idx}] && prod.colors[${idx}].images[0]) mImg.src = prod.colors[${idx}].images[0]; }" style="width:14px;height:14px;border-radius:50%;border:1px solid rgba(255,255,255,0.35);background:${c.hex};cursor:pointer;"></button>`
    ).join('');

    return `
      <div class="product-card" onclick="openProduct('${product.id}')" style="cursor:pointer;">
        <div class="product-img-wrap" style="position:relative;overflow:hidden;border-radius:10px;background:#141417;">
          <img id="marvel-card-img-${product.id}" src="${mainImg}" alt="${product.name}" loading="lazy" style="width:100%;aspect-ratio:4/5;object-fit:cover;display:block;" onmouseover="if('${altImg}') this.src='${altImg}'" onmouseout="this.src='${mainImg}'">
        </div>
        <div style="padding-top:12px;">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#a1a1aa;">${product.tag || 'Drop 01'}</div>
          <div style="font-weight:700;color:#fff;margin:4px 0;">${product.name}</div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <span style="color:#fff;font-weight:700;">₹${product.price}</span>
            ${product.originalPrice ? `<span style="color:#71717a;text-decoration:line-through;font-size:12px;">₹${product.originalPrice}</span>` : ''}
            ${discountPct > 0 ? `<span style="color:#22c55e;font-size:11px;font-weight:600;">${discountPct}% OFF</span>` : ''}
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <div style="display:flex;flex-wrap:wrap;gap:5px;">${swatches}</div>
            <button type="button" onclick="event.stopPropagation(); quickAddToCart('${product.id}');" style="padding:6px 10px;border-radius:6px;border:1px solid #3f3f46;background:#18181b;color:#fff;font-size:11px;cursor:pointer;">+ Bag</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}