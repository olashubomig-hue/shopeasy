/**
 * Profile Page Controller
 * Displays user credentials, order history, and triggers celebration confetti
 * upon arriving from successful checkout (?success=1).
 */
document.addEventListener("DOMContentLoaded", () => {
  // Route Guard
  const user = typeof Auth !== "undefined" ? Auth.current() : null;
  if (!user) {
    window.location.href = "login.html?redirect=profile.html";
    return;
  }

  // 1. Fill Profile Header
  const nameEl = document.getElementById("user-name");
  const emailEl = document.getElementById("user-email");
  const avatarEl = document.getElementById("user-avatar");
  const logoutBtn = document.getElementById("logout-btn");

  if (nameEl) nameEl.textContent = user.name;
  if (emailEl) emailEl.textContent = user.email;
  if (avatarEl) {
    const initials = user.name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    avatarEl.textContent = initials || "U";
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      Auth.logout();
    });
  }

  // 2. Checkout Success Celebration
  const urlParams = new URLSearchParams(window.location.search);
  const isSuccess = urlParams.get("success") === "1";
  const successBanner = document.getElementById("success-banner");

  if (isSuccess && successBanner) {
    successBanner.style.display = "flex";
    triggerConfetti();
  }

  // Confetti Animation in Palette Colors (Sage, Cream, Terracotta, Mustard)
  function triggerConfetti() {
    const canvas = document.getElementById("confetti-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#4a7c59", "#faf3dd", "#c8553d", "#e0a458", "#b8d8be"];
    const particles = [];
    const count = 75;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height * 0.5,
        w: Math.random() * 8 + 6,
        h: Math.random() * 12 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 4 + 3,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 8
      });
    }

    let start = performance.now();
    function renderConfetti(now) {
      const elapsed = now - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      // Stop after 4.5 seconds
      if (elapsed < 4500) {
        requestAnimationFrame(renderConfetti);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    requestAnimationFrame(renderConfetti);
  }

  // 3. Render Order History
  const ordersBox = document.getElementById("orders-box");
  if (ordersBox) {
    const allOrders = store.get("orders", []);
    const userOrders = allOrders
      .filter(o => o.userId === user.id)
      .reverse(); // Newest first

    if (userOrders.length === 0) {
      ordersBox.innerHTML = `
        <div class="checkout-panel" style="padding: 60px 20px; text-align: center;">
          <div style="font-size: 44px; margin-bottom: 12px;">📦</div>
          <h3 style="font-size: 1.4rem; margin-bottom: 6px;">No Orders Placed Yet</h3>
          <p style="color: var(--text-muted); margin-bottom: 22px;">Once you complete an order, you will be able to track item summaries, delivery statuses, and receipts here.</p>
          <a href="shop.html" class="btn btn-sage">Explore Shop Catalog &rarr;</a>
        </div>
      `;
      return;
    }

    ordersBox.innerHTML = userOrders.map(order => {
      const isPaid = order.paymentStatus === "paid";
      const isPaystack = order.paymentMethod === "paystack";

      return `
        <div class="checkout-panel reveal" style="padding: 26px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 14px; margin-bottom: 18px; flex-wrap: wrap; gap: 12px;">
            <div>
              <span style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">Order ID</span>
              <h3 style="font-size: 1.25rem; color: var(--text); margin: 2px 0 0;">${UI.escape(order.id)}</h3>
            </div>
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
              <span class="badge ${isPaid ? 'badge-new' : 'badge-hot'}" style="font-size: 0.78rem;">
                ${isPaid ? '● Paid Online' : '○ Pay on Delivery'}
              </span>
              <span style="font-size: 0.82rem; background: var(--sand); border: 1px solid var(--border); padding: 4px 10px; border-radius: var(--radius-full); font-weight: 600;">
                ${isPaystack ? 'Paystack' : 'Cash on Delivery'}
              </span>
            </div>
          </div>

          <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 16px;">
            📅 Placed on: <strong>${UI.escape(order.date)}</strong>
            ${order.paymentRef ? ` &bull; Reference: <code>${UI.escape(order.paymentRef)}</code>` : ''}
          </div>

          <!-- Items in order -->
          <div style="margin-bottom: 18px;">
            ${order.items.map(item => `
              <div class="summary-row" style="padding: 6px 0;">
                <span>${UI.escape(item.name)} <strong style="color: var(--primary);">× ${item.qty}</strong></span>
                <strong style="color: var(--text);">${UI.formatPrice(item.price * item.qty)}</strong>
              </div>
            `).join("")}
          </div>

          <div style="border-top: 1px solid var(--border); padding-top: 14px; display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 10px;">
            <div style="font-size: 0.85rem; color: var(--text-muted);">
              📍 Deliver to: <strong>${UI.escape(order.customer.name)}</strong>, ${UI.escape(order.customer.address)} (📞 ${UI.escape(order.customer.phone)})
            </div>
            <div style="font-size: 1.15rem; font-weight: 700; color: var(--text);">
              Total Paid: <span style="color: var(--primary); font-size: 1.35rem;">${UI.formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      `;
    }).join("");

    UI.reveal();
  }
});
