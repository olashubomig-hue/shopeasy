/**
 * Full Cart Page Controller (cart.html)
 * Displays item tables, quantity steppers, subtotal, free delivery threshold,
 * clear cart option, and checkout link.
 */
document.addEventListener("DOMContentLoaded", () => {
  const box = document.getElementById("cart-box");
  if (!box) return;

  function renderCart() {
    const items = Cart.items();

    if (items.length === 0) {
      box.innerHTML = `
        <div class="drawer-empty" style="padding: 90px 20px;">
          <div class="drawer-empty-icon">🛒</div>
          <h2 style="font-family: var(--font-display); margin-bottom: 8px;">Your Shopping Bag is Empty</h2>
          <p style="color: var(--text-muted); margin-bottom: 26px;">You haven't added any conscious essentials yet. Discover our latest arrivals and artisan home pieces.</p>
          <a href="shop.html" class="btn btn-sage">Explore Shop Catalog &rarr;</a>
        </div>
      `;
      return;
    }

    const freeShippingThreshold = 50000;
    const grandTotal = Cart.total();
    const remaining = Math.max(0, freeShippingThreshold - grandTotal);
    const progressPercent = Math.min(100, Math.round((grandTotal / freeShippingThreshold) * 100));

    const rows = items.map(item => {
      const p = typeof products !== "undefined" ? products.find(prod => prod.id === item.id) : null;
      if (!p) return "";

      const lineTotal = p.price * item.qty;

      return `
        <div class="drawer-item" data-id="${p.id}" style="padding: 20px 0; align-items: center;">
          <a href="product.html?id=${p.id}">
            <img src="${p.image}" alt="${UI.escape(p.name)}" class="drawer-item-img" style="width: 86px; height: 86px;">
          </a>

          <div class="drawer-item-info" style="gap: 6px;">
            <span style="font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; color: var(--primary);">${p.category}</span>
            <a href="product.html?id=${p.id}">
              <h3 class="drawer-item-name" style="font-size: 1.15rem;">${UI.escape(p.name)}</h3>
            </a>
            <span style="color: var(--text-muted); font-size: 0.92rem;">Unit: ${UI.formatPrice(p.price)}</span>
          </div>

          <div style="display: flex; align-items: center; gap: 20px;">
            <div class="qty-stepper" style="padding: 4px;">
              <button type="button" class="cart-page-qty-minus" data-id="${p.id}" aria-label="Decrease">&minus;</button>
              <span style="padding: 0 12px; font-weight: 700;">${item.qty}</span>
              <button type="button" class="cart-page-qty-plus" data-id="${p.id}" aria-label="Increase">&plus;</button>
            </div>

            <div style="min-width: 110px; text-align: right;">
              <span class="price" style="font-size: 1.25rem;">${UI.formatPrice(lineTotal)}</span>
            </div>

            <button type="button" class="nav-icon-btn cart-page-remove" data-id="${p.id}" aria-label="Remove item" title="Remove item" style="width: 36px; height: 36px; color: var(--terracotta);">
              ✕
            </button>
          </div>
        </div>
      `;
    }).join("");

    box.innerHTML = `
      <div class="checkout-grid">
        <!-- Items Column -->
        <div class="checkout-panel" style="padding: 30px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 16px; margin-bottom: 20px;">
            <h3 style="font-size: 1.3rem;">Selected Items (${Cart.count()})</h3>
            <button type="button" id="clear-cart-btn" style="background:none; border:none; color: var(--text-muted); text-decoration: underline; font-size: 0.85rem; cursor: pointer;">
              Clear All Items
            </button>
          </div>

          <!-- Free delivery progress strip -->
          <div class="free-shipping-bar" style="border-radius: var(--radius-md); margin-bottom: 24px;">
            <div class="free-shipping-text">
              <span>${remaining === 0 ? "🎉 You've unlocked <strong>FREE Delivery</strong> across Nigeria!" : `Add <strong>${UI.formatPrice(remaining)}</strong> more for FREE delivery`}</span>
              <span>${progressPercent}%</span>
            </div>
            <div class="free-shipping-progress">
              <div class="free-shipping-fill" style="width: ${progressPercent}%;"></div>
            </div>
          </div>

          <div class="cart-page-items-list">
            ${rows}
          </div>

          <div style="margin-top: 30px; border-top: 1px solid var(--border); padding-top: 20px;">
            <a href="shop.html" class="btn btn-outline">&larr; Continue Browsing</a>
          </div>
        </div>

        <!-- Order Summary Column -->
        <div class="checkout-panel" style="padding: 30px; height: fit-content;">
          <h3 style="font-size: 1.3rem; margin-bottom: 20px;">Order Summary</h3>
          <div class="summary-row">
            <span>Items Subtotal</span>
            <strong>${UI.formatPrice(grandTotal)}</strong>
          </div>
          <div class="summary-row">
            <span>Estimated Shipping</span>
            <span style="color: var(--primary); font-weight: 700;">${remaining === 0 ? 'FREE' : '₦2,500'}</span>
          </div>
          <div class="summary-row total-row">
            <span>Estimated Total</span>
            <span style="color: var(--primary);">${UI.formatPrice(grandTotal + (remaining === 0 ? 0 : 2500))}</span>
          </div>

          <div style="margin: 24px 0;">
            <a href="checkout.html" class="btn btn-primary btn-full">Proceed to Checkout &rarr;</a>
          </div>

          <div style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.6;">
            <p>🔒 Bank-grade SSL encryption powered by Paystack.</p>
            <p>📦 Dispatch tracking sent via SMS and email.</p>
          </div>
        </div>
      </div>
    `;

    // Clear cart listener
    const clearBtn = document.getElementById("clear-cart-btn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to empty your shopping cart?")) {
          Cart.clear();
          UI.toast("Shopping cart cleared", "info");
          renderCart();
        }
      });
    }
  }

  // Action Delegation for Cart Page
  box.addEventListener("click", (e) => {
    const plusBtn = e.target.closest(".cart-page-qty-plus");
    const minusBtn = e.target.closest(".cart-page-qty-minus");
    const removeBtn = e.target.closest(".cart-page-remove");

    if (plusBtn) {
      const id = Number(plusBtn.dataset.id);
      const item = Cart.items().find(i => i.id === id);
      const product = typeof products !== "undefined" ? products.find(p => p.id === id) : null;
      if (product && item && item.qty >= product.stock) {
        UI.toast("Available stock limit reached", "error");
        return;
      }
      if (item) Cart.setQty(id, item.qty + 1);
      renderCart();
    } else if (minusBtn) {
      const id = Number(minusBtn.dataset.id);
      const item = Cart.items().find(i => i.id === id);
      if (item) Cart.setQty(id, item.qty - 1);
      renderCart();
    } else if (removeBtn) {
      const id = Number(removeBtn.dataset.id);
      Cart.remove(id);
      UI.toast("Item removed from cart");
      renderCart();
    }
  });

  renderCart();
});
