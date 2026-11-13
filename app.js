const PRODUCTS = [
      {
        id: 'deal-01',
        name: "You Can't Please Everyone // Acid Wash Hoodie",
        price: 1799,
        originalPrice: 2499,
        gender: 'unisex',
        category: 'hoodie',
        sku: 'UH62',
        tag: 'Deal for the Day',
        desc: '300 GSM Heavyweight Cotton with lived-in acid wash finish. Oversized streetwear drape featuring dropped shoulders, roomy hood, and high-definition archival back screen print.',
        colors: [
          { name: 'Washed Mineral Grey', hex: '#2b2b2e', images: ['assets/Hoodie acid/grey b.jpg', 'assets/Hoodie acid/Grey.jpg'] },
          { name: 'Washed Indigo Blue', hex: '#263447', images: ['assets/Hoodie acid/blue b.jpg', 'assets/Hoodie acid/blue.jpg'] },
          { name: 'Archival Maroon', hex: '#472228', images: ['assets/Hoodie acid/brown b.jpg', 'assets/Hoodie acid/brown.jpg'] },
          { name: 'Forest Bottle Green', hex: '#1e382b', images: ['assets/Hoodie acid/green b.jpg', 'assets/Hoodie acid/green.jpg'] }
        ]
      },
{
        id: 'biker-hoodie-01',
        name: 'Hypersport Biker Riding Hoodie',
        price: 2199,
        originalPrice: 2899,
        gender: 'men',
        category: 'hoodie',
        sku: 'TRV-BIKE-01',
        tag: 'Riding Armor // Heavy Fleece',
        desc: '380 GSM Heavy Thermal Fleece built for long-distance motorcycle touring. Features reinforced elbow panels, high-wind structured hood, and reflective archival back graphics.',
        colors: [
          { name: 'Onyx Black', hex: '#141416', images: ['assets/hoodies/black front.png', 'assets/hoodies/black back.png'] },
          { name: 'Kawasaki Green', hex: '#1e382b', images: ['assets/hoodies/green front.png', 'assets/hoodies/green back.png'] },
          { name: 'Touring Blue', hex: '#263447', images: ['assets/hoodies/blue front.png', 'assets/hoodies/blue back.png'] },
          { name: 'Chalk White', hex: '#e4e4e7', images: ['assets/hoodies/white front.png', 'assets/hoodies/white back.png'] }
        ]
      },
      {
        id: 'tee-drop-02',
        name: 'Lost But Never Broken // Oversized Tee',
        price: 1199,
        originalPrice: 1999,
        gender: 'unisex',
        category: 't-shirt',
        sku: 'TRV-TEE-02',
        tag: 'Drop 02 // 240 GSM',
        desc: '240 GSM 100% Super Combed Terry Cotton. Features a 4" chest pocket print and high-definition archival compass rose back screen print. Bio-washed and pre-shrunk.',
        colors: [
          { name: 'Onyx Black', hex: '#141416', images: ['assets/broken/black pocket.jpg', 'assets/broken/black f.jpg'] },
          { name: 'Navy Blue', hex: '#263447', images: ['assets/broken/blue pocket.jpg', 'assets/broken/blue f.jpg'] },
          { name: 'Mustard Yellow', hex: '#d97706', images: ['assets/broken/yellow pocket.jpg', 'assets/broken/Yellow f.jpg'] },
          { name: 'Olive / Mehndi', hex: '#3b4d3c', images: ['assets/broken/mehndi.jpg', 'assets/broken/default.jpg'] }
        ]
      },
      {
        id: 'tee-01',
        name: 'BORN TO RULE Tee',
        price: 1299,
        originalPrice: 1899,
        gender: 'men',
        category: 't-shirt',
        sku: 'TRV-TEE-01',
        tag: 'Men // Heavy Tee',
        desc: '280 GSM Luxury Combed Terry Cotton. Archival drop shoulder boxy fit with high-density puff print detailing. Crafted by TRIVÉ Atelier.',
        colors: [{ name: 'Vintage Washed Black', hex: '#141416', images: ['assets/LEGENCY%20EDITION/Screenshot%202026-11-12%20162307.png', 'assets/LEGENCY%20EDITION/Screenshot%202026-11-12%20162035.png'] }]
      },
      {
        id: 'tee-02',
        name: 'Sub-Zero Oversized Tee',
        price: 1399,
        originalPrice: 1999,
        gender: 'women',
        category: 't-shirt',
        sku: 'TRV-TEE-W01',
        tag: 'Coming Soon // Drop 03',
        desc: '260 GSM Ultra-Soft Biowashed Cotton. Clean dropped silhouette crafted for contemporary street drape.',
        colors: [{ name: 'Chalk White', hex: '#e4e4e7', images: ['assets/soonnn.png', 'assets/soonnn.png'] }]
      },
      {
        id: 'shirt-01',
        name: 'Tactical Boxy Overshirt',
        price: 1899,
        originalPrice: 2499,
        gender: 'men',
        category: 'shirt',
        sku: 'TRV-SHT-01',
        tag: 'Coming Soon // Drop 03',
        desc: 'Heavyweight Cotton Twill. Relaxed Cuban collar with twin chest cargo pockets and matte tonal buttons.',
        colors: [{ name: 'Dark Slate', hex: '#1f2937', images: ['assets/soonnn.png', 'assets/soonnn.png'] }]
      },
      {
        id: 'shirt-02',
        name: 'Archival Drape Resort Shirt',
        price: 1799,
        originalPrice: 2399,
        gender: 'women',
        category: 'shirt',
        sku: 'TRV-SHT-W01',
        tag: 'Coming Soon // Drop 03',
        desc: 'Rayon-Tencel blended relaxed resort shirt with minimal collar geometry and tailored vented side hems.',
        colors: [{ name: 'Natural Ecru', hex: '#d6d3d1', images: ['assets/soonnn.png', 'assets/soonnn.png'] }]
      },
      {
        id: 'lower-01',
        name: 'Heavy Terry Archival Sweatpants',
        price: 1699,
        originalPrice: 2299,
        gender: 'men',
        category: 'lower',
        sku: 'TRV-LOW-01',
        tag: 'Coming Soon // Drop 03',
        desc: '380 GSM Heavy French Terry with extended contrast drawstrings, deep zip pockets, and straight ankle cuffs.',
        colors: [{ name: 'Washed Charcoal', hex: '#27272a', images: ['assets/soonnn.png', 'assets/soonnn.png'] }]
      },
      {
        id: 'lower-02',
        name: 'Wide-Leg Minimalist Track Pant',
        price: 1699,
        originalPrice: 2299,
        gender: 'women',
        category: 'lower',
        sku: 'TRV-LOW-W01',
        tag: 'Coming Soon // Drop 03',
        desc: 'High-waisted wide-leg straight trousers with concealed drawstrings and breathable structure.',
        colors: [{ name: 'Obsidian Black', hex: '#09090b', images: ['assets/soonnn.png', 'assets/soonnn.png'] }]
      }
    ];

    let activeGender = 'all';
    let activeCategory = 'all';
    let currentProduct = PRODUCTS[0];
    let selectedColor = currentProduct.colors[0];
    let selectedSize = 'L';
    let cart = [];
    let selectedPaymentMode = 'UPI';
    let discountAmount = 0;

    let reignColor = 'black';
    let reignView = 'front';
    let reignSize = 'L';
    const reignData = {
      black: { 
        front: 'assets/LEGENCY%20EDITION/Screenshot%202026-11-12%20161951.png', 
        back: 'assets/LEGENCY%20EDITION/Screenshot%202026-11-12%20162035.png' 
      },
      olive: { 
        front: 'assets/LEGENCY%20EDITION/Screenshot%202026-11-12%20162026.png', 
        back: 'assets/LEGENCY%20EDITION/Screenshot%202026-11-12%20162104.png' 
      },
      burgundy: { 
        front: 'assets/LEGENCY%20EDITION/Screenshot%202026-11-12%20162006.png', 
        back: 'assets/LEGENCY%20EDITION/Screenshot%202026-11-12%20162044.png' 
      },
      navy: { 
        front: 'assets/LEGENCY%20EDITION/Screenshot%202026-11-12%20162307.png', 
        back: 'assets/LEGENCY%20EDITION/Screenshot%202026-11-12%20162057.png' 
      }
    };

    function setReignC(color, el) {
      reignColor = color;
      document.querySelectorAll('.reign-c-btn').forEach(b => {
        b.classList.remove('active');
        b.style.borderColor = 'var(--border)';
      });
      el.classList.add('active');
      el.style.borderColor = 'var(--accent)';
      updateReignImg();
    }

    function setReignV(view) {
      reignView = view;
      document.getElementById('btn-reign-front').style.background = view === 'front' ? '#222' : '#111';
      document.getElementById('btn-reign-front').style.color = view === 'front' ? '#fff' : '#888';
      document.getElementById('btn-reign-back').style.background = view === 'back' ? '#222' : '#111';
      document.getElementById('btn-reign-back').style.color = view === 'back' ? '#fff' : '#888';
      updateReignImg();
    }

    function updateReignImg() {
      const img = document.getElementById('reign-main-img');
      if (img && reignData[reignColor]) {
        img.src = reignData[reignColor][reignView];
      }
    }

    function selectReignSz(sz, el) {
      reignSize = sz;
      document.querySelectorAll('#born-to-reign-drop .size-btn').forEach(b => {
        b.classList.remove('active');
      });
      el.classList.add('active');
    }

    function orderReignTee() {
      cart.push({
        name: 'Born to Reign // Legacy Edition Tee',
        price: 1299,
        color: reignColor.toUpperCase(),
        size: reignSize,
        image: reignData[reignColor]['front'],
        qty: 1
      });
      updateCartUI();
      toggleCart(true);
    }

    function navigateTo(viewId) {
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      const target = document.getElementById(`view-${viewId}`);
      if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      toggleCart(false);
    }

    function setGenderFilter(gender, btn) {
      activeGender = gender;
      document.querySelectorAll('.gender-tab, .nav-link').forEach(b => {
        if (b.innerText.toLowerCase().includes(gender) || (gender === 'all' && (b.innerText.includes('All') || b.innerText.includes('Archival')))) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
      renderCatalog();
    }

    function setCategoryFilter(category, btn) {
      activeCategory = category;
      document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      renderCatalog();
    }

    function renderCatalog() {
      const grid = document.getElementById('products-grid');
      const filtered = PRODUCTS.filter(p => {
        const matchesGender = (activeGender === 'all') || (p.gender === activeGender) || (p.gender === 'unisex');
        const matchesCategory = (activeCategory === 'all') || (p.category === activeCategory);
        return matchesGender && matchesCategory;
      });

      if (filtered.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:var(--muted); padding:40px 0;">No items found in this section.</p>`;
        return;
      }

      grid.innerHTML = filtered.map(p => `
        <div class="product-card" onclick="openProduct('${p.id}')">
          <span class="card-tag">${p.tag}</span>
          <img src="${p.colors[0].images[0]}" alt="${p.name}">
          <div class="info">
            <h3>${p.name}</h3>
            <span class="price">₹${p.price.toLocaleString('en-IN')}</span>
          </div>
        </div>
      `).join('');
    }

    function openProduct(id) {
      const p = PRODUCTS.find(x => x.id === id);
      if (!p) return;
      currentProduct = p;
      selectedColor = p.colors[0];

      document.getElementById('detail-tag').innerText = p.tag;
      document.getElementById('detail-title').innerText = p.name;
      document.getElementById('detail-price').innerText = `₹${p.price.toLocaleString('en-IN')}`;
      document.getElementById('detail-desc').innerText = p.desc;

      const colorContainer = document.getElementById('color-picker');
      colorContainer.innerHTML = p.colors.map((c, idx) => `
        <div class="color-chip ${idx === 0 ? 'active' : ''}" onclick="selectColor('${c.name}', this)">
          <span class="color-dot" style="background:${c.hex};"></span>
          <span>${c.name}</span>
        </div>
      `).join('');

      updateGallery();
      navigateTo('product');
    }

    function selectColor(colorName, el) {
      const c = currentProduct.colors.find(x => x.name === colorName);
      if (!c) return;
      selectedColor = c;
      document.querySelectorAll('.color-chip').forEach(chip => chip.classList.remove('active'));
      el.classList.add('active');
      updateGallery();
    }

    function updateGallery() {
      document.getElementById('detail-main-img').src = selectedColor.images[0];
      const thumbs = document.getElementById('detail-thumbs');
      thumbs.innerHTML = selectedColor.images.map((img, i) => `
        <div class="thumb ${i === 0 ? 'active' : ''}" onclick="switchImg('${img}', this)">
          <img src="${img}">
        </div>
      `).join('');
    }

    function switchImg(url, el) {
      document.getElementById('detail-main-img').src = url;
      document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
      el.classList.add('active');
    }

    function selectSize(sz, btn) {
      selectedSize = sz;
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }

    function addToCartCurrentProduct() {
      cart.push({
        ...currentProduct,
        color: selectedColor.name,
        image: selectedColor.images[0],
        size: selectedSize,
        price: currentProduct.price,
        qty: 1
      });
      updateCartUI();
      toggleCart(true);
    }

    function updateCartUI() {
      document.getElementById('cart-count').innerText = cart.length;
      const list = document.getElementById('cart-items-list');
      if (cart.length === 0) {
        list.innerHTML = `<p style="color:var(--muted); text-align:center; margin-top:40px;">Your bag is empty.</p>`;
        document.getElementById('drawer-total').innerText = '₹0';
        return;
      }

      let subtotal = 0;
      list.innerHTML = cart.map((item, idx) => {
        subtotal += item.price;
        return `
          <div class="cart-item">
            <img src="${item.image}">
            <div class="cart-item-details">
              <h4>${item.name}</h4>
              <p>${item.color} &bull; Size: ${item.size} &bull; ₹${item.price.toLocaleString('en-IN')}</p>
              <button onclick="removeItem(${idx})" style="background:none;border:none;color:var(--danger);font-size:12px;cursor:pointer;">Remove</button>
            </div>
          </div>
        `;
      }).join('');

      document.getElementById('drawer-total').innerText = `₹${subtotal.toLocaleString('en-IN')}`;
    }

    function removeItem(idx) {
      cart.splice(idx, 1);
      updateCartUI();
    }

    function toggleCart(show) {
      document.getElementById('cart-drawer').classList.toggle('open', show);
      document.getElementById('cart-overlay').classList.toggle('open', show);
    }

    function proceedToCheckoutFromCart() {
      if (cart.length === 0) return alert('Your cart is empty');
      toggleCart(false);
      updateSummary();
      navigateTo('checkout');
    }

    function getTotals() {
      const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
      const total = Math.max(0, subtotal - discountAmount);
      return { subtotal, total };
    }

    function updateSummary() {
      const { subtotal, total } = getTotals();
      document.getElementById('sum-subtotal').innerText = `₹${subtotal.toLocaleString('en-IN')}`;
      document.getElementById('sum-total').innerText = `₹${total.toLocaleString('en-IN')}`;
      
      const couponRow = document.getElementById('coupon-row');
      if (discountAmount > 0) {
        couponRow.style.display = 'flex';
        document.getElementById('sum-discount').innerText = `-₹${discountAmount.toLocaleString('en-IN')}`;
      } else {
        couponRow.style.display = 'none';
      }
    }

    function applyCoupon() {
      const code = document.getElementById('coupon-code').value.trim().toUpperCase();
      const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
      
      if (code === 'FIRSTDROP') {
        discountAmount = Math.round(subtotal * 0.10);
        alert('Promo code applied: 10% off your order');
      } else {
        discountAmount = 0;
        alert('Invalid promo code');
      }
      updateSummary();
    }

    function goToPayment() {
      const name = document.getElementById('cust-name').value.trim();
      const phone = document.getElementById('cust-phone').value.trim();
      const street = document.getElementById('cust-street').value.trim();
      const city = document.getElementById('cust-city').value.trim();

      if (!name || !phone || !street || !city) {
        alert('Please fill out all address details.');
        return;
      }

      const { total } = getTotals();
      const upiUrl = `upi://pay?pa=Dev11verma@ybl&pn=TRIVE&am=${total}&cu=INR&tn=TRIVE_Order`;
      document.getElementById('dynamic-qr').src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;

      navigateTo('payment');
    }

    function selectPaymentMode(mode) {
      selectedPaymentMode = mode;
      document.getElementById('opt-upi').classList.toggle('selected', mode === 'UPI');
      document.getElementById('opt-cod').classList.toggle('selected', mode === 'COD');
      document.getElementById('upi-box').style.display = (mode === 'UPI') ? 'block' : 'none';
    }

    async function dispatchOrder() {
      const btn = document.getElementById('btn-submit-order');
      const utr = (selectedPaymentMode === 'COD') ? 'COD' : document.getElementById('pay-utr').value.trim();

      if (selectedPaymentMode === 'UPI' && (!utr || utr.length < 6)) {
        alert('Please enter your 12-digit UPI Transaction / Reference number.');
        return;
      }

      btn.disabled = true;
      btn.innerText = 'VERIFYING TRANSACTION...';

      const payload = {
        customer: { name: document.getElementById('cust-name').value.trim(), phone: document.getElementById('cust-phone').value.trim() },
        product: { name: cart.map(i => i.name).join(', '), price: getTotals().total },
        color: cart.map(i => i.color).join(', '),
        size: cart.map(i => i.size).join(', '),
        quantity: cart.length,
        utr: utr,
        address: { street: document.getElementById('cust-street').value.trim(), city: document.getElementById('cust-city').value.trim(), state: 'Madhya Pradesh', pincode: document.getElementById('cust-pin').value.trim() || '462001' }
      };

      try {
        const res = await fetch('https://trive-api.onrender.com/api/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.success) {
          document.getElementById('confirmed-id').innerText = `#${data.orderId}`;
          document.getElementById('confirmed-address').innerText = `${payload.address.city}, ${payload.address.pincode}`;
          if (data.whatsappLink) { document.getElementById('btn-wa-confirm').href = data.whatsappLink; }
          cart = [];
          updateCartUI();
          navigateTo('success');
        } else {
          navigateTo('success');
        }
      } catch (err) {
        console.error(err);
        navigateTo('success');
      } finally {
        btn.disabled = false;
        btn.innerText = 'Confirm & Place Order';
      }
    }

    function openModal(id) {
      closeAllModals();
      document.getElementById('modal-backdrop').style.display = 'block';
      const el = document.getElementById(id);
      if (el) el.style.display = 'block';
    }

    function closeAllModals() {
      const backdrop = document.getElementById('modal-backdrop');
      if (backdrop) backdrop.style.display = 'none';
      document.querySelectorAll('.trive-modal').forEach(m => m.style.display = 'none');
    }

    let seconds = 15735;
    setInterval(() => {
      seconds--;
      const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
      const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
      const s = String(seconds % 60).padStart(2, '0');
      const timerEl = document.getElementById('countdown-timer');
      if (timerEl) timerEl.innerText = `ENDS IN ${h}:${m}:${s}`;
    }, 1000);

    renderCatalog();