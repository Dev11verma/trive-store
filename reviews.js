(function () {
  function ensureReviewSection() {
    if (document.getElementById('trive-reviews-section')) return;

    const section = document.createElement('section');
    section.id = 'trive-reviews-section';
    section.style.cssText = 'max-width:1120px;margin:48px auto;padding:28px 18px;border-top:1px solid #242424;color:#f5f5f5;';

    section.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;margin-bottom:22px;">
        <div>
          <div style="font-size:12px;letter-spacing:0.12em;color:#d7ff3e;font-weight:700;">VERIFIED BUYER FEEDBACK</div>
          <h2 style="margin:4px 0 0;font-size:24px;font-weight:800;color:#fff;">Customer Reviews & Fit Notes</h2>
        </div>
        <button id="trive-open-review-btn" type="button" style="padding:10px 16px;border-radius:8px;border:1px solid #d7ff3e;background:#d7ff3e;color:#0a0a0a;font-weight:800;cursor:pointer;min-height:44px;">
          Write a Review
        </button>
      </div>

      <form id="trive-review-form" style="display:none;background:#111;border:1px solid #2a2a2a;border-radius:12px;padding:18px;margin-bottom:24px;">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:12px;">
          <input id="rev-name" type="text" required placeholder="Your Name (e.g., Siddharth K.)" style="padding:10px 12px;border-radius:8px;border:1px solid #333;background:#181818;color:#fff;font-size:16px;" />
          <input id="rev-order" type="text" placeholder="Order ID (optional, e.g., TV-123456)" style="padding:10px 12px;border-radius:8px;border:1px solid #333;background:#181818;color:#fff;font-size:16px;" />
          <select id="rev-rating" style="padding:10px 12px;border-radius:8px;border:1px solid #333;background:#181818;color:#fff;font-size:16px;">
            <option value="5">★★★★★ (5 / 5)</option>
            <option value="4">★★★★☆ (4 / 5)</option>
            <option value="3">★★★☆☆ (3 / 5)</option>
            <option value="2">★★☆☆☆ (2 / 5)</option>
            <option value="1">★☆☆☆☆ (1 / 5)</option>
          </select>
          <input id="rev-item" type="text" placeholder="Product & Size (e.g., Hoodie - L)" style="padding:10px 12px;border-radius:8px;border:1px solid #333;background:#181818;color:#fff;font-size:16px;" />
        </div>
        <textarea id="rev-text" rows="3" required placeholder="Share your thoughts on fabric weight, fit, and delivery..." style="width:100%;box-sizing:border-box;padding:10px 12px;border-radius:8px;border:1px solid #333;background:#181818;color:#fff;font-size:16px;margin-bottom:12px;"></textarea>
        <div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px;">
          <button type="submit" style="padding:10px 18px;border-radius:8px;border:none;background:#d7ff3e;color:#0a0a0a;font-weight:800;cursor:pointer;min-height:44px;">Submit Review</button>
          <span id="rev-status" style="font-size:13px;color:#22c55e;"></span>
        </div>
      </form>

      <div id="trive-reviews-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;"></div>
    `;

    const footer = document.querySelector('footer');
    if (footer && footer.parentNode) {
      footer.parentNode.insertBefore(section, footer);
    } else {
      document.body.appendChild(section);
    }

    const openBtn = document.getElementById('trive-open-review-btn');
    const form = document.getElementById('trive-review-form');
    if (openBtn && form) {
      openBtn.addEventListener('click', () => {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
      });
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = (document.getElementById('rev-name')?.value || '').trim();
        const orderId = (document.getElementById('rev-order')?.value || '').trim() || 'NO_ORDER_ID';
        const rating = Number(document.getElementById('rev-rating')?.value || 5);
        const item = (document.getElementById('rev-item')?.value || '').trim() || 'TRIVÉ Piece';
        const comment = (document.getElementById('rev-text')?.value || '').trim();
        const statusEl = document.getElementById('rev-status');
        if (!name || !comment) return;

        try {
          const endpoint = (typeof API_URL === 'string') ? API_URL : 'https://trivestore.in/api/order';
          await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customer: { name, phone: orderId, email: 'support.trive@gmail.com' },
              address: { street: `[${rating}/5] ${item}: ${comment}`, city: 'India', state: 'India', pincode: '000000' },
              product: { name: item, sku: 'CUSTOMER-REVIEW', price: 0 },
              items: [{ name: item, sku: 'CUSTOMER-REVIEW', price: 0, quantity: 1 }],
              totalAmount: 0,
              paymentMode: 'CUSTOMER_REVIEW',
              utr: `RATING_${rating}_STAR`
            })
          });
          if (statusEl) {
            statusEl.style.color = '#22c55e';
            statusEl.textContent = 'Thank you! Your review has been received for verification.';
          }
          form.reset();
        } catch (err) {
          if (statusEl) {
            statusEl.style.color = '#f87171';
            statusEl.textContent = 'Could not submit right now. Please try again.';
          }
        }
      });
    }
  }

  function renderReviews(list) {
    const grid = document.getElementById('trive-reviews-grid');
    if (!grid) return;
    if (!Array.isArray(list) || list.length === 0) {
      grid.innerHTML = '<div style="color:#a3a3a3;font-size:14px;">Reviews will appear here shortly.</div>';
      return;
    }

    grid.innerHTML = list.map((r) => {
      const starsCount = Math.max(1, Math.min(5, Number(r.rating) || 5));
      const stars = '★'.repeat(starsCount) + '☆'.repeat(5 - starsCount);
      return `
        <article style="background:#121212;border:1px solid #262626;border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:8px;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
            <span style="color:#d7ff3e;font-size:15px;letter-spacing:1px;">${stars}</span>
            <span style="font-size:12px;color:#a3a3a3;">${r.item || ''}</span>
          </div>
          <p style="margin:0;color:#e5e5e5;font-size:14px;line-height:1.5;">"${r.comment || ''}"</p>
          <div style="margin-top:auto;padding-top:8px;border-top:1px solid #1f1f1f;display:flex;justify-content:space-between;font-size:12px;color:#a3a3a3;">
            <strong style="color:#fff;">${r.name || 'Verified Buyer'}</strong>
            <span>${r.fitNote || ''}</span>
          </div>
        </article>
      `;
    }).join('');
  }

  async function initReviews() {
    ensureReviewSection();
    try {
      const res = await fetch('./reviews.json?v=' + Date.now(), { cache: 'no-store' });
      const data = await res.json();
      renderReviews(data);
    } catch (e) {
      renderReviews([]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReviews);
  } else {
    initReviews();
  }
})();
