/**
 * ShopEasy Global UI Controller & Component Engine
 * Includes: Cart Drawer, Search Overlay, Quick View Modal, Custom Cursor,
 * Magnetic Buttons, Page Transitions, 3D Tilt, Theme, and Image Fallback.
 */
const UI = {
  /**
   * Currency formatter in Nigerian Naira (e.g., ₦45,000)
   */
  formatPrice(n) {
    if (n === null || n === undefined || isNaN(n)) return "₦0";
    return "₦" + Number(n).toLocaleString("en-NG");
  },

  /**
   * Escape user-provided text to prevent XSS
   */
  escape(str) {
    if (!str) return "";
    return String(str).replace(/[&<>"']/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[c]));
  },

  /**
   * Render 5-star rating HTML
   */
  renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.4;
    let starsHtml = "";

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        starsHtml += `<span class="star filled" aria-hidden="true">★</span>`;
      } else if (i === fullStars + 1 && hasHalf) {
        starsHtml += `<span class="star half" aria-hidden="true">★</span>`;
      } else {
        starsHtml += `<span class="star empty" aria-hidden="true">☆</span>`;
      }
    }
    return `<span class="stars-wrap" aria-label="${rating} out of 5 stars">${starsHtml}</span>`;
  },

  /**
   * Update cart counter badge in navbar with bounce effect
   */
  updateCartCount(animate = false) {
    const el = document.getElementById("cart-count");
    if (!el) return;
    const count = typeof Cart !== "undefined" ? Cart.count() : 0;
    el.textContent = count;

    if (animate) {
      el.classList.remove("bump");
      void el.offsetWidth; // force reflow
      el.classList.add("bump");
    }
  },

  /**
   * Update wishlist counter badge in navbar with bounce effect
   */
  updateWishlistCount(animate = false) {
    const el = document.getElementById("wishlist-count");
    if (!el) return;
    const count = typeof Wishlist !== "undefined" ? Wishlist.count() : 0;
    el.textContent = count;

    if (animate) {
      el.classList.remove("bump");
      void el.offsetWidth; // force reflow
      el.classList.add("bump");
    }
  },

  /**
   * Update Login/Logout links across navigation
   */
  updateAuthLinks() {
    const links = document.querySelectorAll(".auth-nav-link");
    const user = typeof Auth !== "undefined" ? Auth.current() : null;

    links.forEach(link => {
      if (user) {
        const firstName = UI.escape(user.name.split(" ")[0]);
        link.innerHTML = `Logout (${firstName})`;
        link.href = "#";
        link.onclick = (e) => {
          e.preventDefault();
          Auth.logout();
        };
      } else {
        link.innerHTML = `Login`;
        link.href = "login.html";
        link.onclick = null;
      }
    });
  },

  /**
   * Toast notification that slides in from bottom-right
   */
  toast(msg, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");

    const icon = type === "error" ? "⚠️" : type === "success" ? "✅" : "✨";
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-text">${UI.escape(msg)}</span>
      <button class="toast-close" aria-label="Close notification">&times;</button>
    `;

    toast.querySelector(".toast-close").onclick = () => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 350);
    };

    container.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.classList.add("show");
      });
    });

    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 350);
      }
    }, 3400);
  },

  /* ========================================================================
     CART DRAWER
     ======================================================================== */
  initCartDrawer() {
    let backdrop = document.getElementById("cart-drawer-backdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.id = "cart-drawer-backdrop";
      backdrop.className = "cart-drawer-backdrop";
      backdrop.innerHTML = `
        <div class="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
          <div class="cart-drawer-header">
            <h3 id="cart-drawer-title">Shopping Cart</h3>
            <button class="cart-drawer-close" id="cart-drawer-close-btn" aria-label="Close cart">&times;</button>
          </div>
          <div class="free-shipping-bar" id="drawer-shipping-bar">
            <!-- Free delivery status -->
          </div>
          <div class="cart-drawer-items" id="drawer-items-list">
            <!-- Items rendered here -->
          </div>
          <div class="cart-drawer-footer" id="drawer-footer">
            <!-- Totals & CTA -->
          </div>
        </div>
      `;
      document.body.appendChild(backdrop);

      // Close handlers
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop || e.target.closest("#cart-drawer-close-btn")) {
          UI.closeCartDrawer();
        }
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && backdrop.classList.contains("active")) {
          UI.closeCartDrawer();
        }
      });

      // Cart Drawer action delegation
      const drawer = backdrop.querySelector(".cart-drawer");
      drawer.addEventListener("click", (e) => {
        const plusBtn = e.target.closest(".drawer-qty-plus");
        const minusBtn = e.target.closest(".drawer-qty-minus");
        const removeBtn = e.target.closest(".drawer-item-remove");

        if (plusBtn) {
          const id = Number(plusBtn.dataset.id);
          const item = Cart.items().find(i => i.id === id);
          const product = typeof products !== "undefined" ? products.find(p => p.id === id) : null;
          if (product && item && item.qty >= product.stock) {
            UI.toast("Available stock limit reached", "error");
            return;
          }
          if (item) Cart.setQty(id, item.qty + 1);
        } else if (minusBtn) {
          const id = Number(minusBtn.dataset.id);
          const item = Cart.items().find(i => i.id === id);
          if (item) Cart.setQty(id, item.qty - 1);
        } else if (removeBtn) {
          const id = Number(removeBtn.dataset.id);
          Cart.remove(id);
          UI.toast("Item removed from cart");
        }
      });
    }

    // Attach open triggers to any cart icon/link in nav
    document.querySelectorAll(".nav-cart-trigger, a[href='cart.html']").forEach(link => {
      // If we are already on cart.html, let standard link proceed, otherwise open drawer
      if (!window.location.pathname.endsWith("cart.html")) {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          UI.openCartDrawer();
        });
      }
    });

    UI.renderCartDrawer();
  },

  openCartDrawer() {
    const backdrop = document.getElementById("cart-drawer-backdrop");
    if (backdrop) {
      UI.renderCartDrawer();
      backdrop.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  },

  closeCartDrawer() {
    const backdrop = document.getElementById("cart-drawer-backdrop");
    if (backdrop) {
      backdrop.classList.remove("active");
      document.body.style.overflow = "";
    }
  },

  renderCartDrawer() {
    const shippingBar = document.getElementById("drawer-shipping-bar");
    const itemsList = document.getElementById("drawer-items-list");
    const footer = document.getElementById("drawer-footer");
    if (!itemsList || typeof Cart === "undefined") return;

    const items = Cart.items();
    const total = Cart.total();
    const freeShippingThreshold = 50000; // ₦50,000 threshold

    // 1. Shipping progress bar
    if (shippingBar) {
      const remaining = Math.max(0, freeShippingThreshold - total);
      const progressPercent = Math.min(100, Math.round((total / freeShippingThreshold) * 100));

      if (remaining === 0) {
        shippingBar.innerHTML = `
          <div class="free-shipping-text">
            <span>🎉 You've unlocked <strong>FREE Delivery</strong>!</span>
            <span>100%</span>
          </div>
          <div class="free-shipping-progress">
            <div class="free-shipping-fill" style="width: 100%;"></div>
          </div>
        `;
      } else {
        shippingBar.innerHTML = `
          <div class="free-shipping-text">
            <span>Add <strong>${UI.formatPrice(remaining)}</strong> more for FREE delivery</span>
            <span>${progressPercent}%</span>
          </div>
          <div class="free-shipping-progress">
            <div class="free-shipping-fill" style="width: ${progressPercent}%;"></div>
          </div>
        `;
      }
    }

    // 2. Items list or empty state
    if (items.length === 0) {
      itemsList.innerHTML = `
        <div class="drawer-empty">
          <div class="drawer-empty-icon">🛒</div>
          <h4>Your Cart is Empty</h4>
          <p>Discover our conscious essentials and curated items.</p>
          <a href="shop.html" class="btn btn-sage btn-sm" onclick="UI.closeCartDrawer()">Start Shopping &rarr;</a>
        </div>
      `;
      if (footer) footer.style.display = "none";
      return;
    }

    if (footer) footer.style.display = "block";

    itemsList.innerHTML = items.map(item => {
      const p = typeof products !== "undefined" ? products.find(prod => prod.id === item.id) : null;
      if (!p) return "";
      return `
        <div class="drawer-item" data-id="${p.id}">
          <img src="${p.image}" alt="${UI.escape(p.name)}" class="drawer-item-img">
          <div class="drawer-item-info">
            <h4 class="drawer-item-name">${UI.escape(p.name)}</h4>
            <span class="drawer-item-price">${UI.formatPrice(p.price)}</span>
            <div class="drawer-item-actions">
              <div class="qty-stepper">
                <button type="button" class="drawer-qty-minus" data-id="${p.id}" aria-label="Decrease">&minus;</button>
                <span>${item.qty}</span>
                <button type="button" class="drawer-qty-plus" data-id="${p.id}" aria-label="Increase">&plus;</button>
              </div>
              <button type="button" class="drawer-item-remove" data-id="${p.id}">Remove</button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    // 3. Footer totals and buttons
    if (footer) {
      footer.innerHTML = `
        <div class="drawer-subtotal-row">
          <span>Subtotal</span>
          <strong>${UI.formatPrice(total)}</strong>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 14px;">Taxes and shipping calculated at checkout.</p>
        <div class="drawer-cta-group">
          <a href="checkout.html" class="btn btn-primary btn-full" onclick="UI.closeCartDrawer()">Proceed to Checkout &rarr;</a>
          <a href="cart.html" class="btn btn-outline btn-full" onclick="UI.closeCartDrawer()">View Full Cart</a>
        </div>
      `;
    }
  },

  /* ========================================================================
     SEARCH OVERLAY ("/" shortcut or search button)
     ======================================================================== */
  initSearchOverlay() {
    let overlay = document.getElementById("search-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "search-overlay";
      overlay.className = "search-overlay";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.innerHTML = `
        <div class="search-modal-container">
          <div class="search-modal-header">
            <input type="text" id="global-search-input" placeholder="Type to search products, styles, brands..." autocomplete="off">
            <button class="search-modal-close" id="search-modal-close-btn" aria-label="Close search">
              <span>Close</span> <kbd>ESC</kbd>
            </button>
          </div>
          <div id="search-overlay-results" class="search-results-list">
            <!-- Results dynamically populated -->
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      // Close handlers
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay || e.target.closest("#search-modal-close-btn")) {
          UI.closeSearchOverlay();
        }
      });

      const input = overlay.querySelector("#global-search-input");
      const resultsContainer = overlay.querySelector("#search-overlay-results");

      input.addEventListener("input", () => {
        const query = input.value.trim().toLowerCase();
        if (!query) {
          resultsContainer.innerHTML = `<p style="grid-column: 1/-1; color: var(--text-muted); font-size: 0.95rem;">Type keywords like "watch", "lamp", "sneakers", "electronics"...</p>`;
          return;
        }

        const matches = (typeof products !== "undefined" ? products : []).filter(p => {
          return p.name.toLowerCase().includes(query) ||
                 p.category.toLowerCase().includes(query) ||
                 p.description.toLowerCase().includes(query);
        });

        if (matches.length === 0) {
          resultsContainer.innerHTML = `
            <div style="grid-column: 1/-1; padding: 40px 0; text-align: center; color: var(--text-muted);">
              <h3>No matching products found</h3>
              <p>Try searching for other keywords or explore our shop catalog.</p>
            </div>
          `;
          return;
        }

        resultsContainer.innerHTML = matches.map(p => `
          <a href="product.html?id=${p.id}" class="search-result-item" onclick="UI.closeSearchOverlay()">
            <img src="${p.image}" alt="${UI.escape(p.name)}">
            <div>
              <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--primary); font-weight: 600;">${p.category}</span>
              <h4>${UI.escape(p.name)}</h4>
              <span class="price">${UI.formatPrice(p.price)}</span>
            </div>
          </a>
        `).join("");
      });
    }

    // Keyboard trigger: press "/" to open search (unless typing in another input)
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
        e.preventDefault();
        UI.openSearchOverlay();
      } else if (e.key === "Escape" && overlay.classList.contains("active")) {
        UI.closeSearchOverlay();
      }
    });

    // Attach to search button in navbar
    document.querySelectorAll(".nav-search-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        UI.openSearchOverlay();
      });
    });
  },

  openSearchOverlay() {
    const overlay = document.getElementById("search-overlay");
    if (overlay) {
      overlay.classList.add("active");
      document.body.style.overflow = "hidden";
      const input = overlay.querySelector("#global-search-input");
      if (input) {
        input.value = "";
        setTimeout(() => input.focus(), 150);
        const resultsContainer = overlay.querySelector("#search-overlay-results");
        if (resultsContainer) {
          resultsContainer.innerHTML = `<p style="grid-column: 1/-1; color: var(--text-muted); font-size: 0.95rem;">Type keywords like "watch", "lamp", "sneakers", "electronics"...</p>`;
        }
      }
    }
  },

  closeSearchOverlay() {
    const overlay = document.getElementById("search-overlay");
    if (overlay) {
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  },

  /* ========================================================================
     QUICK VIEW MODAL
     ======================================================================== */
  openQuickView(productId) {
    const pId = Number(productId);
    const p = typeof products !== "undefined" ? products.find(item => item.id === pId) : null;
    if (!p) return;

    let modal = document.getElementById("quick-view-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "quick-view-modal";
      modal.className = "modal-backdrop";
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      modal.setAttribute("aria-labelledby", "quick-view-title");
      document.body.appendChild(modal);

      modal.addEventListener("click", (e) => {
        if (e.target === modal || e.target.closest(".modal-close-btn")) {
          UI.closeQuickView();
        }
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("active")) {
          UI.closeQuickView();
        }
      });
    }

    const isFav = typeof Wishlist !== "undefined" ? Wishlist.has(p.id) : false;
    const isLowStock = p.stock <= 5;

    modal.innerHTML = `
      <div class="modal-dialog">
        <button class="modal-close-btn" aria-label="Close modal">&times;</button>
        <div class="modal-content-grid">
          <div class="modal-image-col">
            <img src="${p.image}" alt="${UI.escape(p.name)}" class="modal-main-img">
            <div class="card-badges" style="top: 18px; left: 18px;">
              ${p.isNew ? '<span class="badge badge-new">New</span>' : ''}
              ${p.oldPrice ? '<span class="badge badge-sale">Sale</span>' : ''}
            </div>
          </div>
          <div class="modal-info-col">
            <span style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--primary); font-weight: 600; margin-bottom: 6px;">${p.category}</span>
            <h2 id="quick-view-title">${UI.escape(p.name)}</h2>
            <div class="card-stars" style="margin-bottom: 14px;">
              ${UI.renderStars(p.rating)}
              <span class="rating-num">(${p.rating} / 5.0)</span>
            </div>
            <div class="modal-price-row">
              <span class="price" style="font-size: 1.6rem;">${UI.formatPrice(p.price)}</span>
              ${p.oldPrice ? `<span class="old-price" style="font-size: 1.1rem;">${UI.formatPrice(p.oldPrice)}</span>` : ""}
            </div>
            <p class="modal-desc">${UI.escape(p.description)}</p>
            <p style="font-size: 0.85rem; font-weight: 600; margin-bottom: 24px; color: ${isLowStock ? 'var(--terracotta)' : 'var(--primary)'};">
              ${isLowStock ? `⚠️ Only ${p.stock} units left in stock!` : `✅ In Stock (${p.stock} units available)`}
            </p>
            
            <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 18px;">
              <div class="qty-stepper" style="padding: 4px;">
                <button type="button" id="modal-qty-minus" aria-label="Decrease">&minus;</button>
                <span id="modal-qty-val" style="padding: 0 12px;">1</span>
                <button type="button" id="modal-qty-plus" aria-label="Increase">&plus;</button>
              </div>
              <button class="btn btn-primary" id="modal-add-to-cart" style="flex: 1;">Add to Cart</button>
              <button class="wishlist-btn ${isFav ? 'active' : ''}" data-id="${p.id}" aria-label="Wishlist" style="position: static; width: 44px; height: 44px;">
                <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </button>
            </div>
            <div style="margin-top: auto; padding-top: 12px;">
              <a href="product.html?id=${p.id}" style="font-size: 0.9rem; color: var(--primary); font-weight: 600; text-decoration: underline;" onclick="UI.closeQuickView()">View full product details &rarr;</a>
            </div>
          </div>
        </div>
      </div>
    `;

    // Modal Qty controls
    let qVal = 1;
    const qtyValEl = modal.querySelector("#modal-qty-val");
    modal.querySelector("#modal-qty-minus").onclick = () => {
      if (qVal > 1) {
        qVal--;
        qtyValEl.textContent = qVal;
      }
    };
    modal.querySelector("#modal-qty-plus").onclick = () => {
      if (qVal < p.stock) {
        qVal++;
        qtyValEl.textContent = qVal;
      } else {
        UI.toast("Available stock limit reached", "error");
      }
    };

    modal.querySelector("#modal-add-to-cart").onclick = () => {
      Cart.add(p.id, qVal, true);
      UI.toast(`${qVal} × "${p.name}" added to cart! 🛒`);
      UI.closeQuickView();
    };

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  },

  closeQuickView() {
    const modal = document.getElementById("quick-view-modal");
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  },

  /* ========================================================================
     CUSTOM CURSOR (Desktop only)
     ======================================================================== */
  initCustomCursor() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    let dot = document.querySelector(".custom-cursor-dot");
    let ring = document.querySelector(".custom-cursor-ring");

    if (!dot) {
      dot = document.createElement("div");
      dot.className = "custom-cursor-dot";
      document.body.appendChild(dot);
    }
    if (!ring) {
      ring = document.createElement("div");
      ring.className = "custom-cursor-ring";
      document.body.appendChild(ring);
    }

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    }, { passive: true });

    function renderRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.left = `${ringX.toFixed(2)}px`;
      ring.style.top = `${ringY.toFixed(2)}px`;
      requestAnimationFrame(renderRing);
    }
    requestAnimationFrame(renderRing);

    // Cursor hover states
    document.addEventListener("mouseover", (e) => {
      const interactive = e.target.closest("button, a, input, select, .chip-btn, .toggle-tab-btn");
      const productImg = e.target.closest(".card-media, .cat-tile, .main-image-box");

      if (productImg) {
        document.body.classList.add("cursor-view");
        document.body.classList.remove("cursor-hover");
      } else if (interactive) {
        document.body.classList.add("cursor-hover");
        document.body.classList.remove("cursor-view");
      } else {
        document.body.classList.remove("cursor-hover", "cursor-view");
      }
    });
  },

  /* ========================================================================
     MAGNETIC BUTTONS
     ======================================================================== */
  initMagneticButtons() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    const magneticElements = document.querySelectorAll(".btn-primary, .btn-sage");
    magneticElements.forEach(btn => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${(x * 0.2).toFixed(1)}px, ${(y * 0.2).toFixed(1)}px)`;
      });

      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "translate(0px, 0px)";
      });
    });
  },

  /* ========================================================================
     SMOOTH PAGE TRANSITIONS (Cream panel sweep)
     ======================================================================== */
  initPageTransitions() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let overlay = document.querySelector(".page-transition-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "page-transition-overlay";
      document.body.appendChild(overlay);
    }

    // Intercept internal page navigations
    document.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (!link) return;
      const href = link.getAttribute("href");

      // Check if it's an internal HTML link and not an anchor / hash / mailto / external
      if (
        href &&
        !href.startsWith("#") &&
        !href.startsWith("mailto:") &&
        !href.startsWith("tel:") &&
        !href.startsWith("http") &&
        !link.hasAttribute("download") &&
        link.target !== "_blank" &&
        href.includes(".html")
      ) {
        // Prevent default and perform sweep
        e.preventDefault();
        overlay.classList.add("sweeping");
        setTimeout(() => {
          window.location.href = href;
        }, 320);
      }
    });

    // Reveal page after loading
    window.addEventListener("pageshow", () => {
      overlay.classList.remove("sweeping");
    });
  },

  /* ========================================================================
     3D CARD TILT EFFECT
     ======================================================================== */
  initTiltCards() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    const cards = document.querySelectorAll(".card:not([data-tilt-init])");
    cards.forEach(card => {
      card.setAttribute("data-tilt-init", "true");

      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5; // max 5 deg
        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)";
      });
    });
  },

  /* ========================================================================
     SCROLL REVEAL OBSERVER
     ======================================================================== */
  reveal() {
    const els = document.querySelectorAll(".reveal:not(.visible)");
    if (!("IntersectionObserver" in window)) {
      els.forEach(el => el.classList.add("visible"));
      return;
    }

    if (!UI._io) {
      UI._io = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            en.target.classList.add("visible");
            UI._io.unobserve(en.target);
          }
        });
      }, { threshold: 0.1 });
    }

    els.forEach((el, i) => {
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      UI._io.observe(el);
    });
  },

  /* ========================================================================
     THEME TOGGLE (Light / Dark)
     ======================================================================== */
  initTheme() {
    const saved = store.get("theme", null);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved === "dark" || (saved === null && prefersDark);

    document.documentElement.classList.toggle("dark", isDark);
    UI.updateThemeToggleIcon(isDark);
  },

  toggleTheme() {
    const isCurrentlyDark = document.documentElement.classList.contains("dark");
    const newTheme = isCurrentlyDark ? "light" : "dark";
    document.documentElement.classList.toggle("dark", !isCurrentlyDark);
    store.set("theme", newTheme);
    UI.updateThemeToggleIcon(!isCurrentlyDark);
    UI.toast(`Switched to ${newTheme} mode 🌓`);
  },

  updateThemeToggleIcon(isDark) {
    document.querySelectorAll(".theme-toggle-btn").forEach(btn => {
      btn.innerHTML = isDark ? "☀️" : "🌙";
      btn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
      btn.title = isDark ? "Switch to light mode" : "Switch to dark mode";
    });
  }
};

/* ==========================================================================
   Global Image Fallback Handler (Picsum Seed Fallback)
   ========================================================================== */
function fixImg(img) {
  if (!img || img.dataset.fb) return;
  img.dataset.fb = "1";
  const src = img.getAttribute("src") || "product";
  const name = src.split("/").pop().replace(/\.[a-z0-9]+$/i, "");
  img.src = `https://picsum.photos/seed/${encodeURIComponent(name || "shopeasy")}/800/700`;
}

// Global capture-phase error listener for images
document.addEventListener("error", (e) => {
  if (e.target && e.target.tagName === "IMG") {
    fixImg(e.target);
  }
}, true);

// Initialize all UI systems on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  // Check image fallback for any already cached/broken images
  document.querySelectorAll("img").forEach(img => {
    if (img.complete && img.naturalWidth === 0) {
      fixImg(img);
    }
  });

  // Init Theme & Nav sync
  UI.initTheme();
  UI.updateCartCount(false);
  UI.updateWishlistCount(false);
  UI.updateAuthLinks();

  // Init Interactive Systems
  UI.initCartDrawer();
  UI.initSearchOverlay();
  UI.initCustomCursor();
  UI.initMagneticButtons();
  UI.initPageTransitions();
  UI.reveal();
  UI.initTiltCards();

  // Navbar scroll behavior
  const nav = document.querySelector(".navbar");
  window.addEventListener("scroll", () => {
    if (nav) {
      nav.classList.toggle("scrolled", window.scrollY > 25);
    }
  }, { passive: true });

  // Mobile hamburger menu toggle
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");
  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("open");
      const expanded = hamburger.classList.contains("active");
      hamburger.setAttribute("aria-expanded", expanded);
    });

    navMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navMenu.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Theme toggle button click listener
  document.querySelectorAll(".theme-toggle-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      UI.toggleTheme();
    });
  });

  // Back to top button
  let topBtn = document.querySelector(".to-top");
  if (!topBtn) {
    topBtn = document.createElement("button");
    topBtn.className = "to-top";
    topBtn.innerHTML = "↑";
    topBtn.setAttribute("aria-label", "Back to top");
    topBtn.title = "Back to top";
    document.body.appendChild(topBtn);
  }
  topBtn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
  window.addEventListener("scroll", () => {
    topBtn.classList.toggle("show", window.scrollY > 400);
  }, { passive: true });

  // Quick View delegation
  document.addEventListener("click", (e) => {
    const qvBtn = e.target.closest(".quick-view-btn");
    if (qvBtn) {
      e.preventDefault();
      e.stopPropagation();
      const id = qvBtn.dataset.id;
      UI.openQuickView(id);
    }
  });

  // Quick Add delegation
  document.addEventListener("click", (e) => {
    const qaBtn = e.target.closest(".quick-add-btn");
    if (qaBtn) {
      e.preventDefault();
      e.stopPropagation();
      const id = Number(qaBtn.dataset.id);
      Cart.add(id, 1, true); // Adds and opens drawer
      const prod = typeof products !== "undefined" ? products.find(p => p.id === id) : null;
      UI.toast(`Added ${prod ? `"${prod.name}"` : "item"} to cart! 🛒`);
    }
  });
});