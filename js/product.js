/**
 * Product Details Page Controller
 * Includes:
 * - Image Gallery with Thumbnail Switching & Hover Zoom
 * - Quantity Stepper & Stock Validation
 * - Add to Cart (with Cart Drawer opening)
 * - Wishlist Synchronization & Heart Pop
 * - Link Sharing with Toast
 * - Sticky Mini Add-to-Cart Bar on scroll
 * - "You May Also Like" Related Products
 * - "Recently Viewed" Strip
 * - Graceful "Product Not Found" handling
 */
document.addEventListener("DOMContentLoaded", () => {
  const detailBox = document.getElementById("product-detail");
  const relatedGrid = document.getElementById("related-grid");
  const relatedSection = document.getElementById("related-section");
  const recentGrid = document.getElementById("recently-viewed-grid");
  const recentSection = document.getElementById("recent-section");
  const breadcrumbTitle = document.getElementById("breadcrumb-title");

  // Sticky bar elements
  const stickyBar = document.getElementById("sticky-bar");
  const stickyImg = document.getElementById("sticky-img");
  const stickyTitle = document.getElementById("sticky-title");
  const stickyPrice = document.getElementById("sticky-price");
  const stickyAddBtn = document.getElementById("sticky-add-btn");

  if (!detailBox || typeof products === "undefined") return;

  const urlParams = new URLSearchParams(window.location.search);
  const id = Number(urlParams.get("id"));
  const product = products.find(p => p.id === id);

  // If product not found
  if (!product) {
    document.title = "ShopEasy — Product Not Found";
    if (breadcrumbTitle) breadcrumbTitle.textContent = "Not Found";
    detailBox.innerHTML = `
      <div class="drawer-empty" style="padding: 80px 20px;">
        <div class="drawer-empty-icon">❌</div>
        <h2 style="font-family: var(--font-display); margin-bottom: 8px;">Product Not Found</h2>
        <p style="color: var(--text-muted); margin-bottom: 24px;">The piece you are searching for does not exist or may have been archived.</p>
        <a href="shop.html" class="btn btn-sage">Return to Shop Catalog &rarr;</a>
      </div>
    `;
    if (relatedSection) relatedSection.style.display = "none";
    if (recentSection) recentSection.style.display = "none";
    return;
  }

  // Update Page Title and Breadcrumb
  document.title = `ShopEasy — ${product.name}`;
  if (breadcrumbTitle) breadcrumbTitle.textContent = product.name;

  // Track Recently Viewed (exclude current product)
  let recentList = store.get("recentlyViewed", []);
  recentList = recentList.filter(item => item !== product.id);
  recentList.unshift(product.id);
  if (recentList.length > 5) recentList = recentList.slice(0, 5);
  store.set("recentlyViewed", recentList);

  // Helper for alternate thumbnail angles
  function getVariantSrc(src, index) {
    return src.replace(/(\.[a-z0-9]+)$/i, `-${index}$1`);
  }

  const galleryImages = [
    product.image,
    getVariantSrc(product.image, 2),
    getVariantSrc(product.image, 3)
  ];

  const isFav = typeof Wishlist !== "undefined" ? Wishlist.has(product.id) : false;
  const isLowStock = product.stock <= 5;

  detailBox.innerHTML = `
    <div class="product-details-grid">
      <!-- Gallery Column -->
      <div class="gallery-wrapper">
        <div class="main-image-box" id="main-image-box">
          <img src="${product.image}" alt="${UI.escape(product.name)}" id="main-product-img">
          <div class="card-badges" style="top: 20px; left: 20px;">
            <span class="badge ${product.category.toLowerCase()}">${product.category}</span>
            ${product.isNew ? '<span class="badge badge-new">New Arrival</span>' : ''}
            ${product.oldPrice ? '<span class="badge badge-sale">Sale</span>' : ''}
          </div>
        </div>
        <div class="thumbs-row">
          ${galleryImages.map((src, i) => `
            <div class="thumb-item ${i === 0 ? 'active' : ''}" data-src="${src}" tabindex="0">
              <img src="${src}" alt="Angle ${i + 1}">
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Information Column -->
      <div class="product-info-column" style="display: flex; flex-direction: column;">
        <span style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; color: var(--primary); margin-bottom: 8px;">
          ${product.category}
        </span>
        <h1 style="font-size: clamp(2rem, 3.5vw, 2.8rem); line-height: 1.15; margin-bottom: 14px;">
          ${UI.escape(product.name)}
        </h1>

        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 18px;">
          <div class="card-stars" style="margin: 0;">${UI.renderStars(product.rating)}</div>
          <span style="font-size: 0.9rem; color: var(--text-muted); font-weight: 500;">
            ${product.rating} / 5.0 (Verified Buyer Reviews)
          </span>
        </div>

        <div class="card-price-row" style="margin-bottom: 24px;">
          <span class="price" style="font-size: 2rem;">${UI.formatPrice(product.price)}</span>
          ${product.oldPrice ? `<span class="old-price" style="font-size: 1.25rem;">${UI.formatPrice(product.oldPrice)}</span>` : ""}
        </div>

        <div style="background: var(--sand); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px 20px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 0.98rem; line-height: 1.6; color: var(--text);">
            ${UI.escape(product.description)}
          </p>
        </div>

        <!-- Stock Status Alert -->
        <div style="margin-bottom: 24px;">
          ${isLowStock ? `
            <span style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700; color: var(--terracotta); font-size: 0.9rem;">
              ⚠️ Limited Availability: Only ${product.stock} pieces remaining!
            </span>
          ` : `
            <span style="display: inline-flex; align-items: center; gap: 6px; font-weight: 600; color: var(--primary); font-size: 0.9rem;">
              ✅ In Stock &amp; Ready to Dispatch (${product.stock} available)
            </span>
          `}
        </div>

        <!-- Actions Row -->
        <div style="display: flex; gap: 14px; align-items: center; margin-bottom: 20px; flex-wrap: wrap;">
          <!-- Quantity Stepper -->
          <div class="qty-stepper" style="padding: 6px;">
            <button type="button" id="qty-minus" aria-label="Decrease">&minus;</button>
            <span id="qty-val" style="padding: 0 16px; font-size: 1rem;">1</span>
            <button type="button" id="qty-plus" aria-label="Increase">&plus;</button>
          </div>

          <!-- Main Add to Cart -->
          <button type="button" class="btn btn-primary" id="main-add-btn" style="flex: 1; min-width: 200px;">
            Add to Cart &bull; ${UI.formatPrice(product.price)}
          </button>

          <!-- Wishlist Button -->
          <button type="button" class="wishlist-btn ${isFav ? 'active' : ''}" id="product-wishlist-btn" data-id="${product.id}" aria-label="Wishlist" style="position: static; width: 48px; height: 48px;">
            <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </button>

          <!-- Share Button -->
          <button type="button" class="nav-icon-btn" id="share-btn" aria-label="Share product" title="Share link" style="width: 48px; height: 48px;">
            🔗
          </button>
        </div>

        <!-- Guarantees list -->
        <div style="border-top: 1px solid var(--border); padding-top: 20px; margin-top: auto; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.85rem; color: var(--text-muted);">
          <div>🚚 Dispatched within 24 hours</div>
          <div>🔒 Paystack Secure Encryption</div>
          <div>↩️ 7-Day Exchange Window</div>
          <div>✨ 100% Guaranteed Genuine</div>
        </div>
      </div>
    </div>
  `;

  // 1. Gallery Thumbnail Interaction
  const mainImg = document.getElementById("main-product-img");
  const thumbs = document.querySelectorAll(".thumb-item");
  thumbs.forEach(thumb => {
    thumb.addEventListener("click", () => {
      thumbs.forEach(t => t.classList.remove("active"));
      thumb.classList.add("active");
      const src = thumb.dataset.src;
      if (mainImg) mainImg.src = src;
    });
  });

  // 2. Mouse-Follow Zoom on Main Image
  const zoomBox = document.getElementById("main-image-box");
  if (zoomBox && mainImg && !window.matchMedia("(hover: none)").matches) {
    zoomBox.addEventListener("mousemove", (e) => {
      const rect = zoomBox.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      mainImg.style.transformOrigin = `${x}% ${y}%`;
      mainImg.style.transform = "scale(1.75)";
    });

    zoomBox.addEventListener("mouseleave", () => {
      mainImg.style.transformOrigin = "center center";
      mainImg.style.transform = "scale(1)";
    });
  }

  // 3. Quantity Stepper
  let currentQty = 1;
  const qtyVal = document.getElementById("qty-val");
  const minusBtn = document.getElementById("qty-minus");
  const plusBtn = document.getElementById("qty-plus");

  if (minusBtn && plusBtn && qtyVal) {
    minusBtn.addEventListener("click", () => {
      if (currentQty > 1) {
        currentQty--;
        qtyVal.textContent = currentQty;
      }
    });

    plusBtn.addEventListener("click", () => {
      if (currentQty < product.stock) {
        currentQty++;
        qtyVal.textContent = currentQty;
      } else {
        UI.toast("Available stock limit reached", "error");
      }
    });
  }

  // 4. Main Add-to-Cart Trigger
  const mainAddBtn = document.getElementById("main-add-btn");
  if (mainAddBtn) {
    mainAddBtn.addEventListener("click", () => {
      Cart.add(product.id, currentQty, true); // Opens drawer
      UI.toast(`Added ${currentQty} × "${product.name}" to cart! 🛒`, "success");
    });
  }

  // 5. Share Button
  const shareBtn = document.getElementById("share-btn");
  if (shareBtn) {
    shareBtn.addEventListener("click", () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).then(() => {
          UI.toast("Direct product link copied to clipboard! 🔗", "success");
        }).catch(() => {
          UI.toast("Link copied: " + window.location.href, "info");
        });
      } else {
        UI.toast("Link copied: " + window.location.href, "info");
      }
    });
  }

  // 6. Sticky Mini Add Bar Controller
  if (stickyBar && mainAddBtn) {
    if (stickyImg) stickyImg.src = product.image;
    if (stickyTitle) stickyTitle.textContent = product.name;
    if (stickyPrice) stickyPrice.textContent = UI.formatPrice(product.price);

    if (stickyAddBtn) {
      stickyAddBtn.onclick = () => {
        Cart.add(product.id, currentQty, true);
        UI.toast(`Added ${currentQty} × "${product.name}" to cart! 🛒`, "success");
      };
    }

    if ("IntersectionObserver" in window) {
      const stickyObserver = new IntersectionObserver(([entry]) => {
        // Show sticky bar when main button is NOT intersecting and window scrolled down
        const isBelow = entry.boundingClientRect.top < 0;
        stickyBar.classList.toggle("visible", !entry.isIntersecting && isBelow);
      }, { threshold: 0 });

      stickyObserver.observe(mainAddBtn);
    }
  }

  // 7. Render "You May Also Like" (Related products from same category)
  if (relatedGrid) {
    const related = products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);

    if (related.length > 0) {
      relatedGrid.innerHTML = related.map(p => `
        <div class="card reveal" data-card-id="${p.id}">
          <div class="card-media">
            <span class="badge ${p.category.toLowerCase()}" style="position: absolute; top: 12px; left: 12px;">${p.category}</span>
            <a href="product.html?id=${p.id}">
              <img src="${p.image}" alt="${UI.escape(p.name)}" loading="lazy">
            </a>
          </div>
          <div class="card-body">
            <a href="product.html?id=${p.id}">
              <h3 class="card-title">${UI.escape(p.name)}</h3>
            </a>
            <div class="card-price-row">
              <span class="price">${UI.formatPrice(p.price)}</span>
            </div>
            <a href="product.html?id=${p.id}" class="btn btn-outline btn-full btn-sm">View Item</a>
          </div>
        </div>
      `).join("");
    } else {
      if (relatedSection) relatedSection.style.display = "none";
    }
  }

  // 8. Render "Recently Viewed" Strip
  if (recentGrid) {
    const viewedIds = store.get("recentlyViewed", []).filter(vId => vId !== product.id);
    const viewedProducts = viewedIds
      .map(vId => products.find(p => p.id === vId))
      .filter(Boolean)
      .slice(0, 4);

    if (viewedProducts.length > 0) {
      recentGrid.innerHTML = viewedProducts.map(p => `
        <div class="card reveal" data-card-id="${p.id}">
          <div class="card-media">
            <span class="badge ${p.category.toLowerCase()}" style="position: absolute; top: 12px; left: 12px;">${p.category}</span>
            <a href="product.html?id=${p.id}">
              <img src="${p.image}" alt="${UI.escape(p.name)}" loading="lazy">
            </a>
          </div>
          <div class="card-body">
            <a href="product.html?id=${p.id}">
              <h3 class="card-title">${UI.escape(p.name)}</h3>
            </a>
            <div class="card-price-row">
              <span class="price">${UI.formatPrice(p.price)}</span>
            </div>
            <a href="product.html?id=${p.id}" class="btn btn-outline btn-full btn-sm">View Item</a>
          </div>
        </div>
      `).join("");
    } else {
      if (recentSection) recentSection.style.display = "none";
    }
  }

  UI.reveal();
  UI.initTiltCards();
});