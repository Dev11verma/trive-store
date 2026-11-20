(function () {
  if (document.getElementById('trive-fit-widget')) return;

  const style = document.createElement('style');
  style.textContent = `
    #trive-fit-widget { position: fixed; right: 18px; bottom: 18px; z-index: 9998; display: flex; gap: 8px; }
    .trive-float-btn { background: #121212; color: #fff; border: 1px solid #333; border-radius: 999px; padding: 10px 15px; font-size: 12px; font-weight: 800; letter-spacing: 0.04em; cursor: pointer; box-shadow: 0 10px 26px rgba(0,0,0,0.45); text-decoration: none; display: inline-flex; align-items: center; gap: 6px; }
    .trive-float-btn.accent { background: #d7ff3e; color: #0a0a0a; border-color: #d7ff3e; }
    #trive-fit-modal { display: none; position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,0.78); align-items: center; justify-content: center; padding: 16px; }
    #trive-fit-card { background: #111; border: 1px solid #2b2b2b; border-radius: 14px; max-width: 520px; width: 100%; padding: 22px; color: #f5f5f5; }
    #trive-fit-card table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 13px; }
    #trive-fit-card th, #trive-fit-card td { border: 1px solid #262626; padding: 9px 10px; text-align: center; }
    #trive-fit-card th { background: #191919; color: #d7ff3e; font-weight: 800; }
  `;
  document.head.appendChild(style);

  const widget = document.createElement('div');
  widget.id = 'trive-fit-widget';
  widget.innerHTML = `
    <button type="button" id="trive-open-fit" class="trive-float-btn">SIZE &amp; FIT GUIDE</button>
    <a href="https://instagram.com/the_trivestore" target="_blank" rel="noopener" class="trive-float-btn accent">@THE_TRIVESTORE</a>
  `;
  document.body.appendChild(widget);

  const modal = document.createElement('div');
  modal.id = 'trive-fit-modal';
  modal.innerHTML = `
    <div id="trive-fit-card">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-size:11px;letter-spacing:0.12em;color:#d7ff3e;font-weight:800;">TRIVÉ HEAVYWEAR // 240–380 GSM</div>
          <h3 style="margin:4px 0 0;font-size:20px;color:#fff;">Oversized Fit &amp; Size Chart (Inches)</h3>
        </div>
        <button type="button" id="trive-close-fit" style="background:#1c1c1c;color:#fff;border:1px solid #333;border-radius:8px;padding:6px 11px;cursor:pointer;font-weight:800;">✕</button>
      </div>
      <table>
        <thead>
          <tr><th>Size</th><th>Chest</th><th>Length</th><th>Shoulder</th><th>Fit Feel</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>S</strong></td><td>42"</td><td>27"</td><td>20.5"</td><td>Relaxed Boxy</td></tr>
          <tr><td><strong>M</strong></td><td>44"</td><td>28"</td><td>21.5"</td><td>True Oversized</td></tr>
          <tr><td><strong>L</strong></td><td>46"</td><td>29"</td><td>22.5"</td><td>Drop-Shoulder Street</td></tr>
          <tr><td><strong>XL</strong></td><td>48"</td><td>30"</td><td>23.5"</td><td>Heavy Oversized</td></tr>
        </tbody>
      </table>
      <p style="margin:0;font-size:12px;color:#b5b5b5;line-height:1.5;">
        <strong>Sizing Tip:</strong> Stick to your regular size for our signature boxy streetwear drape, or size down 1 for a cleaner standard fit.
      </p>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('trive-open-fit').addEventListener('click', () => { modal.style.display = 'flex'; });
  document.getElementById('trive-close-fit').addEventListener('click', () => { modal.style.display = 'none'; });
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
})();
