/**
 * ShopEasy Home Page Controller
 * Includes: Session Preloader (0-100% counter, sage line, slide up),
 * Jesper-style "Featured / All" toggle, Animated Stats Counter,
 * Promotional Image Slider, and Newsletter Subscription.
 */
document.addEventListener("DOMContentLoaded", () => {
  /* ========================================================================
     1. SESSION PRELOADER (First visit per session only)
     ======================================================================== */
  const preloader = document.getElementById("preloader");
  const preloaderCount = document.getElementById("preloader-count");
  const preloaderBar = document.getElementById("preloader-bar");
  const preloaderSkip = document.getElementById("preloader-skip");

  const hasSeenPreloader = sessionStorage.getItem("shopeasy_preloader_seen");

  if (hasSeenPreloader && preloader) {
    preloader.style.display = "none";
  } else if (preloader) {
    let progress = 0;
    const duration = 1600; // max ~1.6s
    const startTime = performance.now();
    let isDismissed = false;

    function finishPreloader() {
      if (isDismissed) return;
      isDismissed = true;
      sessionStorage.setItem("shopeasy_preloader_seen", "true");
      preloader.classList.add("hidden");
      setTimeout(() => {
        preloader.style.display = "none";
      }, 700);
    }

    function stepPreloader(now) {
      if (isDismissed) return;
      const elapsed = now - startTime;
      progress = Math.min(100, Math.round((elapsed / duration) * 100));

      if (preloaderCount) preloaderCount.textContent = `${progress}%`;
      if (preloaderBar) preloaderBar.style.width = `${progress}%`;

      if (progress < 100) {
        requestAnimationFrame(stepPreloader);
      } else {
        setTimeout(finishPreloader, 180);
      }
    }

    requestAnimationFrame(stepPreloader);

    if (preloaderSkip) {
      preloaderSkip.addEventListener("click", finishPreloader);
    }
    // Also skippable on click or key
    preloader.addEventListener("click", finishPreloader);
  }

  /* ========================================================================
     2. "FEATURED / ALL" TOGGLE (Jesper Landberg style)
     ======================================================================== */
  const featuredGrid = document.getElementById("featured-grid");
  const toggleFeaturedBtn = document.getElementById("toggle-featured");
  const toggleAllBtn = document.getElementById("toggle-all");

  let currentViewMode = "featured"; // 'featured' or 'all'

  function renderHomeProducts() {
    if (!featuredGrid || typeof products === "undefined") return;

    if (currentViewMode === "featured") {
      // 4 prominent showcase cards
      const displayProducts = products.slice(0, 4);
      featuredGrid.className = "product-grid featured-mode";

      featuredGrid.innerHTML = displayProducts.map(p => {
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
    } else {
      // Compact full list (Jesper-style editorial list)
      featuredGrid.className = "product-list-view";
      featuredGrid.innerHTML = products.map(p => `
        <div class="product-list-row reveal" data-card-id="${p.id}" onclick="window.location.href='product.html?id=${p.id}'">
          <div class="list-col-info">
            <span class="list-prod-cat">${p.category}</span>
            <span class="list-prod-name">${UI.escape(p.name)}</span>
            ${p.isNew ? '<span class="badge badge-new" style="margin-left:8px;">New</span>' : ''}
          </div>
          <div class="list-col-price">
            <span class="price">${UI.formatPrice(p.price)}</span>
            <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); Cart.add(${p.id}, 1, true)">+ Add</button>
          </div>
        </div>
      `).join("");
    }

    if (typeof UI !== "undefined") {
      UI.reveal();
      UI.initTiltCards();
    }
  }

  if (toggleFeaturedBtn && toggleAllBtn) {
    toggleFeaturedBtn.addEventListener("click", () => {
      if (currentViewMode === "featured") return;
      currentViewMode = "featured";
      toggleFeaturedBtn.classList.add("active");
      toggleAllBtn.classList.remove("active");
      renderHomeProducts();
    });

    toggleAllBtn.addEventListener("click", () => {
      if (currentViewMode === "all") return;
      currentViewMode = "all";
      toggleAllBtn.classList.add("active");
      toggleFeaturedBtn.classList.remove("active");
      renderHomeProducts();
    });
  }

  renderHomeProducts();

  /* ========================================================================
     3. ANIMATED STATS STRIP (Count-up on scroll)
     ======================================================================== */
  const statEls = document.querySelectorAll(".stat-num[data-target]");
  if (statEls.length > 0 && "IntersectionObserver" in window) {
    const statsObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseFloat(el.getAttribute("data-target"));
          const prefix = el.getAttribute("data-prefix") || "";
          const suffix = el.getAttribute("data-suffix") || "";
          const duration = 1800;
          const startTime = performance.now();

          const update = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out quad
            const ease = 1 - (1 - progress) * (1 - progress);
            const current = (ease * target).toFixed(target % 1 === 0 ? 0 : 1);
            el.textContent = `${prefix}${Number(current).toLocaleString()}${suffix}`;

            if (progress < 1) {
              requestAnimationFrame(update);
            } else {
              el.textContent = `${prefix}${target.toLocaleString()}${suffix}`;
            }
          };

          requestAnimationFrame(update);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.25 });

    statEls.forEach(el => statsObserver.observe(el));
  }

  /* ========================================================================
     4. PROMOTIONAL SLIDER BANNER (Auto-slide, pause on hover, zoom)
     ======================================================================== */
  const slider = document.getElementById("promo-slider");
  if (slider) {
    const slides = slider.querySelectorAll(".promo-slide");
    const dotsContainer = document.getElementById("promo-dots");
    const prevBtn = document.getElementById("promo-prev");
    const nextBtn = document.getElementById("promo-next");
    let currentSlide = 0;
    let autoSlideTimer = null;

    if (dotsContainer && slides.length > 0) {
      dotsContainer.innerHTML = "";
      slides.forEach((_, idx) => {
        const dot = document.createElement("button");
        dot.className = `slider-dot ${idx === 0 ? 'active' : ''}`;
        dot.setAttribute("aria-label", `Slide ${idx + 1}`);
        dot.addEventListener("click", () => {
          showSlide(idx);
          resetTimer();
        });
        dotsContainer.appendChild(dot);
      });
    }

    const dots = dotsContainer ? dotsContainer.querySelectorAll(".slider-dot") : [];

    function showSlide(index) {
      currentSlide = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === currentSlide);
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === currentSlide);
      });
    }

    function resetTimer() {
      if (autoSlideTimer) clearInterval(autoSlideTimer);
      autoSlideTimer = setInterval(() => {
        showSlide(currentSlide + 1);
      }, 5500);
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        showSlide(currentSlide - 1);
        resetTimer();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        showSlide(currentSlide + 1);
        resetTimer();
      });
    }

    slider.addEventListener("mouseenter", () => clearInterval(autoSlideTimer));
    slider.addEventListener("mouseleave", resetTimer);

    showSlide(0);
    resetTimer();
  }

  /* ========================================================================
     5. NEWSLETTER SIGNUP (LocalStorage + Toast)
     ======================================================================== */
  const newsletterForm = document.getElementById("newsletter-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("newsletter-email");
      const email = (input ? input.value : "").trim().toLowerCase();

      if (!email || !email.includes("@")) {
        UI.toast("Please enter a valid email address.", "error");
        return;
      }

      const list = store.get("newsletter_subscribers", []);
      if (list.includes(email)) {
        UI.toast("You're already subscribed to ShopEasy news! 💌", "info");
      } else {
        list.push(email);
        store.set("newsletter_subscribers", list);
        UI.toast("Thank you for subscribing! Welcome to ShopEasy VIP. ✨", "success");
      }

      if (input) input.value = "";
    });
  }
});
