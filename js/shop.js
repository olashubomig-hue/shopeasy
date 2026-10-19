/**
 * Shop Page Controller
 * Features:
 * - Live search, Category chips, Price range slider, Sorting
 * - URL parameter synchronization (?cat=Fashion)
 * - Grid / List view toggle (Ledup + Jesper inspired)
 * - List view floating image cursor tracker (desktop)
 * - Staggered entrance and skeleton shimmer
 * - Empty state with filter reset
 */
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("shop-container");
  const searchInput = document.getElementById("shop-search");
  const priceSlider = document.getElementById("price-slider");
  const priceVal = document.getElementById("price-val");
  const sortSelect = document.getElementById("sort-select");
  const countEl = document.getElementById("shop-count");
  const chipBtns = document.querySelectorAll("#category-chips .chip-btn");
  const gridBtn = document.getElementById("view-grid-btn");
  const listBtn = document.getElementById("view-list-btn");
  const floatingThumb = document.getElementById("floating-thumb");
  const floatingThumbImg = document.getElementById("floating-thumb-img");

  if (!container || typeof products === "undefined") return;

  // Compute maximum price dynamically
  const maxCatalogPrice = Math.max(...products.map(p => p.price));
  if (priceSlider) {
    priceSlider.max = maxCatalogPrice;
    priceSlider.value = maxCatalogPrice;
    if (priceVal) priceVal.textContent = UI.formatPrice(maxCatalogPrice);
  }

  // Active filter state
  let currentCategory = "all";
  let currentLayout = "grid"; // 'grid' or 'list'

  // Read URL param ?cat=...
  const urlParams = new URLSearchParams(window.location.search);
  const startCat = urlParams.get("cat");
  if (startCat) {
    chipBtns.forEach(btn => {
      if (btn.dataset.cat.toLowerCase() === startCat.toLowerCase()) {
        btn.classList.add("active");
        currentCategory = btn.dataset.cat;
      } else {
        btn.classList.remove("active");
      }
    });
  }

  function renderShop(withShimmer = false) {
    if (withShimmer) {
      container.innerHTML = `
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
      `;
      setTimeout(() => renderShopContent(), 120);
    } else {
      renderShopContent();
    }
  }

  function renderShopContent() {
    const term = (searchInput ? searchInput.value : "").trim().toLowerCase();
    const maxP = priceSlider ? Number(priceSlider.value) : maxCatalogPrice;
    const sort = sortSelect ? sortSelect.value : "featured";

    if (priceVal && priceSlider) {
      priceVal.textContent = UI.formatPrice(maxP);
    }

    // Filter products
    let filtered = products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(term) ||
                          p.category.toLowerCase().includes(term) ||
                          p.description.toLowerCase().includes(term);
      const matchCat = currentCategory === "all" || p.category.toLowerCase() === currentCategory.toLowerCase();
      const matchPrice = p.price <= maxP;
      return matchSearch && matchCat && matchPrice;
    });

    // Sort
    if (sort === "low") filtered.sort((a, b) => a.price - b.price);
    else if (sort === "high") filtered.sort((a, b) => b.price - a.price);
    else if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "newest") filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));

    // Update result count
    if (countEl) {
      countEl.innerHTML = `Showing <strong>${filtered.length}</strong> conscious piece${filtered.length === 1 ? '' : 's'}`;
    }

    // Empty state
    if (filtered.length === 0) {
      container.className = "";
      container.innerHTML = `
        <div class="drawer-empty" style="grid-column: 1/-1; padding: 60px 20px;">
          <div class="drawer-empty-icon">🔍</div>
          <h3 style="font-family: var(--font-display); margin-bottom: 8px;">No matching items found</h3>
          <p style="color: var(--text-muted); margin-bottom: 22px;">Try broadening your keywords, adjusting the price ceiling, or resetting category filters.</p>
          <button type="button" class="btn btn-sage" id="reset-all-filters-btn">Reset All Filters</button>
        </div>
      `;

      const resetBtn = document.getElementById("reset-all-filters-btn");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          if (searchInput) searchInput.value = "";
          currentCategory = "all";
          chipBtns.forEach(b => b.classList.toggle("active", b.dataset.cat === "all"));
          if (priceSlider) priceSlider.value = maxCatalogPrice;
          if (sortSelect) sortSelect.value = "featured";
          window.history.replaceState({}, "", window.location.pathname);
          renderShop(true);
        });
      }
      return;
    }

    // Render Grid vs List
    if (currentLayout === "grid") {
      container.className = "product-grid";
      container.innerHTML = filtered.map(p => {
        const isFav = typeof Wishlist !== "undefined" ? Wishlist.has(p.id) : false;
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
              <button class="wishlist-btn ${isFav ? 'active' : ''}" data-id="${p.id}" aria-label="Wishlist" title="Add to Wishlist">
                <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </button>
              <a href="product.html?id=${p.id}">
                <img src="${p.image}" alt="${UI.escape(p.name)}" loading="lazy">
              </a>
              <div class="card-hover-actions">
                <button class="quick-view-btn" data-id="${p.id}" title="Quick View" aria-label="Quick View">👁️</button>
                <button class="btn btn-sage quick-add-btn" data-id="${p.id}">Add to Cart</button>
              </div>
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
              <button class="btn btn-primary btn-full" onclick="Cart.add(${p.id}, 1, true)">Add to Cart</button>
            </div>
          </div>
        `;
      }).join("");

      UI.reveal();
      UI.initTiltCards();
    } else {
      // List View (Ledup + Jesper Landberg style)
      container.className = "product-list-view";
      container.innerHTML = filtered.map(p => `
        <div class="product-list-row reveal" data-card-id="${p.id}" data-img="${p.image}" onclick="window.location.href='product.html?id=${p.id}'">
          <div class="list-col-info">
            <span class="list-prod-cat">${p.category}</span>
            <span class="list-prod-name">${UI.escape(p.name)}</span>
            ${p.isNew ? '<span class="badge badge-new" style="margin-left:8px;">New</span>' : ''}
          </div>
          <div class="list-col-price">
            <span class="price">${UI.formatPrice(p.price)}</span>
            <button class="btn btn-sm btn-sage" onclick="event.stopPropagation(); Cart.add(${p.id}, 1, true)">+ Add to Cart</button>
          </div>
        </div>
      `).join("");

      UI.reveal();
      initListRowHoverThumbnails();
    }
  }

  // Floating thumbnail follower for list view
  function initListRowHoverThumbnails() {
    if (!floatingThumb || !floatingThumbImg) return;
    if (window.matchMedia("(hover: none)").matches) return;

    const rows = container.querySelectorAll(".product-list-row");
    rows.forEach(row => {
      row.addEventListener("mouseenter", (e) => {
        const imgSrc = row.dataset.img;
        if (imgSrc) {
          floatingThumbImg.src = imgSrc;
          floatingThumb.classList.add("visible");
        }
      });

      row.addEventListener("mousemove", (e) => {
        floatingThumb.style.left = `${e.clientX + 20}px`;
        floatingThumb.style.top = `${e.clientY}px`;
      });

      row.addEventListener("mouseleave", () => {
        floatingThumb.classList.remove("visible");
      });
    });
  }

  // Chip Clicks
  chipBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      chipBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.dataset.cat;

      // Update URL query
      if (currentCategory === "all") {
        window.history.replaceState({}, "", window.location.pathname);
      } else {
        window.history.replaceState({}, "", `?cat=${encodeURIComponent(currentCategory)}`);
      }

      renderShop(true);
    });
  });

  // Search input with small debounce
  let searchTimeout = null;
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => renderShop(false), 200);
    });
  }

  // Price slider
  if (priceSlider) {
    priceSlider.addEventListener("input", () => renderShop(false));
  }

  // Sort select
  if (sortSelect) {
    sortSelect.addEventListener("change", () => renderShop(true));
  }

  // View layout toggles
  if (gridBtn && listBtn) {
    gridBtn.addEventListener("click", () => {
      if (currentLayout === "grid") return;
      currentLayout = "grid";
      gridBtn.classList.add("active");
      listBtn.classList.remove("active");
      if (floatingThumb) floatingThumb.classList.remove("visible");
      renderShop(false);
    });

    listBtn.addEventListener("click", () => {
      if (currentLayout === "list") return;
      currentLayout = "list";
      listBtn.classList.add("active");
      gridBtn.classList.remove("active");
      renderShop(false);
    });
  }

  // Initial render
  renderShop(false);
});