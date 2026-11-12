$HtmlPath = "index.html"
if (!(Test-Path $HtmlPath)) {
    Write-Host "Error: index.html not found!" -ForegroundColor Red
    exit
}

$HtmlContent = Get-Content -Path $HtmlPath -Raw

$BornToReignSection = @"

  <!-- NEW DROP: BORN TO REIGN // LEGACY EDITION TEE -->
  <section id="born-to-reign-drop" style="max-width:1100px;margin:60px auto 40px;padding:0 20px;">
    <div style="border-top:1px solid #222;padding-top:40px;margin-bottom:28px;display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:12px;">
      <div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
          <span style="background:#d7ff3e;color:#000;font-size:10px;font-weight:900;padding:3px 8px;border-radius:4px;letter-spacing:0.1em;text-transform:uppercase;">Legacy Edition</span>
          <span style="font-size:11px;font-weight:900;letter-spacing:0.2em;color:#888;text-transform:uppercase;">240 GSM HEAVYWEAR</span>
        </div>
        <h2 style="font-size: clamp(22px, 4vw, 34px);font-weight:900;margin:0;letter-spacing:0.05em;color:#fff;text-transform:uppercase;">Born to Reign // Legacy Edition Tee</h2>
      </div>
      <div style="font-size:24px;font-weight:900;color:#fff;">?1,299 <span style="font-size:13px;color:#666;text-decoration:line-through;font-weight:normal;">?1,999</span></div>
    </div>

    <div style="display:grid;grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));gap:32px;align-items:start;">
      <div style="background:#0e0e0e;border:1px solid #1f1f1f;border-radius:16px;padding:20px;text-align:center;">
        <img id="reign-main-img" src="public/images/products/born-to-reign/Front_1_c_2.jpg" alt="Born to Reign Tee" style="width:100%;max-height:460px;object-fit:contain;border-radius:10px;transition:opacity 0.2s ease;">
        <div style="display:flex;justify-content:center;gap:10px;margin-top:16px;">
          <button type="button" onclick="setReignV('front')" id="btn-reign-front" style="background:#222;color:#fff;border:1px solid #444;padding:8px 16px;border-radius:6px;font-size:11px;font-weight:800;letter-spacing:0.1em;cursor:pointer;text-transform:uppercase;">Front View</button>
          <button type="button" onclick="setReignV('back')" id="btn-reign-back" style="background:#111;color:#888;border:1px solid #222;padding:8px 16px;border-radius:6px;font-size:11px;font-weight:800;letter-spacing:0.1em;cursor:pointer;text-transform:uppercase;">Back View (Graphic)</button>
        </div>
      </div>

      <div style="background:#0e0e0e;border:1px solid #1f1f1f;border-radius:16px;padding:26px;">
        <label style="display:block;font-size:11px;font-weight:800;letter-spacing:0.15em;color:#888;text-transform:uppercase;margin-bottom:10px;">Select Colorway</label>
        <div style="display:flex;gap:10px;margin-bottom:24px;flex-wrap:wrap;">
          <button type="button" onclick="setReignC('black')" class="reign-c-btn active" data-color="black" style="padding:10px 14px;background:#161616;border:2px solid #d7ff3e;color:#fff;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;">Charcoal / Washed Black</button>
          <button type="button" onclick="setReignC('olive')" class="reign-c-btn" data-color="olive" style="padding:10px 14px;background:#161616;border:2px solid #222;color:#aaa;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;">Vintage Olive</button>
          <button type="button" onclick="setReignC('burgundy')" class="reign-c-btn" data-color="burgundy" style="padding:10px 14px;background:#161616;border:2px solid #222;color:#aaa;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;">Deep Burgundy</button>
          <button type="button" onclick="setReignC('navy')" class="reign-c-btn" data-color="navy" style="padding:10px 14px;background:#161616;border:2px solid #222;color:#aaa;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;">Washed Indigo</button>
          <button type="button" onclick="setReignC('slate')" class="reign-c-btn" data-color="slate" style="padding:10px 14px;background:#161616;border:2px solid #222;color:#aaa;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;">Dark Slate</button>
        </div>

        <label style="display:block;font-size:11px;font-weight:800;letter-spacing:0.15em;color:#888;text-transform:uppercase;margin-bottom:10px;">Select Size</label>
        <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:8px;margin-bottom:24px;">
          <button type="button" onclick="selectReignSz(this, 'S')" style="padding:12px 0;background:#161616;border:1px solid #2a2a2a;color:#eee;border-radius:6px;font-weight:800;cursor:pointer;">S</button>
          <button type="button" onclick="selectReignSz(this, 'M')" style="padding:12px 0;background:#161616;border:1px solid #2a2a2a;color:#eee;border-radius:6px;font-weight:800;cursor:pointer;">M</button>
          <button type="button" onclick="selectReignSz(this, 'L')" class="selected-reign-sz" style="padding:12px 0;background:#161616;border:2px solid #d7ff3e;color:#fff;border-radius:6px;font-weight:800;cursor:pointer;">L</button>
          <button type="button" onclick="selectReignSz(this, 'XL')" style="padding:12px 0;background:#161616;border:1px solid #2a2a2a;color:#eee;border-radius:6px;font-weight:800;cursor:pointer;">XL</button>
          <button type="button" onclick="selectReignSz(this, '2XL')" style="padding:12px 0;background:#161616;border:1px solid #2a2a2a;color:#eee;border-radius:6px;font-weight:800;cursor:pointer;">2XL</button>
        </div>

        <div style="font-size:12px;color:#777;line-height:1.7;margin-bottom:24px;border-top:1px solid #1a1a1a;padding-top:16px;">
          <div>• <strong>Graphic:</strong> Iconic Skeleton King 'Born to Reign' Back Print</div>
          <div>• <strong>Fabric:</strong> 240 GSM Super Combed Cotton with Bio-Wash</div>
        </div>

        <button type="button" onclick="orderReignTee()" style="width:100%;padding:16px;background:#d7ff3e;color:#000;border:none;border-radius:8px;font-weight:900;letter-spacing:0.12em;font-size:14px;text-transform:uppercase;cursor:pointer;">
          Order Born to Reign Tee &bull; ?1,299 (COD / UPI)
        </button>
      </div>
    </div>
  </section>

  <script>
    let reignColor = 'black';
    let reignView = 'front';
    let reignSize = 'L';
    const reignData = {
      black: { front: 'public/images/products/born-to-reign/Front_1_c_2.jpg', back: 'public/images/products/born-to-reign/Back_2_c_2.jpg' },
      olive: { front: 'public/images/products/born-to-reign/Front_1_c_8.jpg', back: 'public/images/products/born-to-reign/Back_2_c_8.jpg' },
      burgundy: { front: 'public/images/products/born-to-reign/Front_1_c_25.jpg', back: 'public/images/products/born-to-reign/Back_2_c_25.jpg' },
      navy: { front: 'public/images/products/born-to-reign/Front_1_c_3.jpg', back: 'public/images/products/born-to-reign/Back_2_c_3.jpg' },
      slate: { front: 'public/images/products/born-to-reign/Front_1_c_41.jpg', back: 'public/images/products/born-to-reign/Back_2_c_41.jpg' }
    };

    function setReignC(color) {
      reignColor = color;
      document.querySelectorAll('.reign-c-btn').forEach(btn => {
        btn.style.borderColor = btn.dataset.color === color ? '#d7ff3e' : '#222';
        btn.style.color = btn.dataset.color === color ? '#fff' : '#aaa';
      });
      updateReignImg();
    }

    function setReignV(view) {
      reignView = view;
      document.getElementById('btn-reign-front').style.background = view === 'front' ? '#222' : '#111';
      document.getElementById('btn-reign-front').style.borderColor = view === 'front' ? '#444' : '#222';
      document.getElementById('btn-reign-front').style.color = view === 'front' ? '#fff' : '#888';

      document.getElementById('btn-reign-back').style.background = view === 'back' ? '#222' : '#111';
      document.getElementById('btn-reign-back').style.borderColor = view === 'back' ? '#444' : '#222';
      document.getElementById('btn-reign-back').style.color = view === 'back' ? '#fff' : '#888';
      updateReignImg();
    }

    function updateReignImg() {
      const img = document.getElementById('reign-main-img');
      if (img && reignData[reignColor]) {
        img.src = reignData[reignColor][reignView];
      }
    }

    function selectReignSz(el, sz) {
      reignSize = sz;
      el.parentElement.querySelectorAll('button').forEach(b => {
        b.style.borderColor = '#2a2a2a';
        b.style.color = '#eee';
      });
      el.style.borderColor = '#d7ff3e';
      el.style.color = '#fff';
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
  </script>
</body>
</html>
