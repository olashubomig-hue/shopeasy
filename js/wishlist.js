/**
 * Wishlist Manager with LocalStorage persistence and navbar badge sync.
 */
const Wishlist = {
  items() {
    return store.get("wishlist", []);
  },

  has(id) {
    const pId = Number(id);
    return this.items().includes(pId);
  },

  toggle(id) {
    const pId = Number(id);
    let list = this.items();
    let added = false;

    if (list.includes(pId)) {
      list = list.filter(item => item !== pId);
      added = false;
    } else {
      list.push(pId);
      added = true;
    }

    store.set("wishlist", list);

    if (typeof UI !== "undefined" && UI.updateWishlistCount) {
      UI.updateWishlistCount(true);
    }

    // Synchronize any heart buttons on the current page
    document.querySelectorAll(`.wishlist-btn[data-id="${pId}"]`).forEach(btn => {
      btn.classList.toggle("active", added);
      btn.setAttribute("aria-label", added ? "Remove from wishlist" : "Add to wishlist");
    });

    return added;
  },

  remove(id) {
    const pId = Number(id);
    const list = this.items().filter(item => item !== pId);
    store.set("wishlist", list);

    if (typeof UI !== "undefined" && UI.updateWishlistCount) {
      UI.updateWishlistCount(false);
    }

    document.querySelectorAll(`.wishlist-btn[data-id="${pId}"]`).forEach(btn => {
      btn.classList.remove("active");
      btn.setAttribute("aria-label", "Add to wishlist");
    });
  },

  count() {
    return this.items().length;
  },

  moveToCart(id) {
    const pId = Number(id);
    if (typeof Cart !== "undefined") {
      Cart.add(pId, 1, true); // Opens cart drawer
    }
    this.remove(pId);
  },

  /**
   * Render wishlist view if element exists on wishlist.html
   */
  renderWishlistPage() {
    const box = document.getElementById("wishlist-box");
    if (!box) return;

    const ids = this.items();
    if (ids.length === 0) {
      box.innerHTML = `
        <div class="drawer-empty" style="padding: 80px 20px;">
          <div class="drawer-empty-icon">💖</div>
          <h2 style="font-family: var(--font-display); margin-bottom: 8px;">Your Wishlist is Empty</h2>
          <p style="color: var(--text-muted); margin-bottom: 24px;">Explore our curated catalog and tap the heart on any item to save it for later.</p>
          <a href="shop.html" class="btn btn-sage">Explore Shop Catalog &rarr;</a>
        </div>
      `;
      return;
    }

    const savedProducts = ids
      .map(id => typeof products !== "undefined" ? products.find(p => p.id === id) : null)
      .filter(Boolean);

    box.innerHTML = `
      <div class="product-grid">
        ${savedProducts.map(p => {
          const isLowStock = p.stock <= 5;
          return `
            <div class="card reveal" data-card-id="${p.id}">
              <div class="card-media">
                <div class="card-badges">
                  <span class="badge ${p.category.toLowerCase()}">${p.category}</span>
                  ${p.isNew ? '<span class="badge badge-new">New</span>' : ''}
                  ${p.oldPrice ? '<span class="badge badge-sale">Sale</span>' : ''}
                  ${isLowStock ? '<span class="badge badge-hot">Low Stock</span>' : ''}
                </div>
                <button class="wishlist-btn active" data-id="${p.id}" aria-label="Remove from wishlist" title="Remove from wishlist">
                  <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </button>
                <a href="product.html?id=${p.id}">
                  <img src="${p.image}" alt="${UI.escape(p.name)}" loading="lazy">
                </a>
              </div>
              <div class="card-body">
                <div class="card-meta">
                  <span class="card-category">${p.category}</span>
                  <div class="card-stars">${UI.renderStars(p.rating)} <span class="rating-num">(${p.rating})</span></div>
                </div>
                <a href="product.html?id=${p.id}">
                  <h3 class="card-title">${UI.escape(p.name)}</h3>
                </a>
                <div class="card-price-row">
                  <span class="price">${UI.formatPrice(p.price)}</span>
                  ${p.oldPrice ? `<span class="old-price">${UI.formatPrice(p.oldPrice)}</span>` : ""}
                </div>
                <div style="display: flex; gap: 8px; margin-top: 10px;">
                  <button class="btn btn-primary btn-full move-to-cart-btn" data-id="${p.id}">Move to Cart</button>
                  <button class="btn btn-outline remove-wishlist-btn" data-id="${p.id}" aria-label="Remove" title="Remove">✕</button>
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;

    if (typeof UI !== "undefined") {
      UI.reveal();
      UI.initTiltCards();
    }
  }
};

// Global Wishlist clicks delegation
document.addEventListener("click", (e) => {
  const heartBtn = e.target.closest(".wishlist-btn");
  if (heartBtn) {
    e.preventDefault();
    e.stopPropagation();
    const id = Number(heartBtn.dataset.id);
    const added = Wishlist.toggle(id);
    if (typeof UI !== "undefined") {
      UI.toast(added ? "Saved to your Wishlist 💖" : "Removed from Wishlist", "info");
    }
    if (document.getElementById("wishlist-box")) {
      Wishlist.renderWishlistPage();
    }
    return;
  }

  const moveBtn = e.target.closest(".move-to-cart-btn");
  if (moveBtn) {
    e.preventDefault();
    const id = Number(moveBtn.dataset.id);
    Wishlist.moveToCart(id);
    if (typeof UI !== "undefined") {
      UI.toast("Item moved to your Cart 🛒", "success");
    }
    Wishlist.renderWishlistPage();
    return;
  }

  const removeBtn = e.target.closest(".remove-wishlist-btn");
  if (removeBtn) {
    e.preventDefault();
    const id = Number(removeBtn.dataset.id);
    Wishlist.remove(id);
    if (typeof UI !== "undefined") {
      UI.toast("Removed from Wishlist", "info");
    }
    Wishlist.renderWishlistPage();
    return;
  }
});

// Auto-render if on wishlist page
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("wishlist-box")) {
    Wishlist.renderWishlistPage();
  }
});
