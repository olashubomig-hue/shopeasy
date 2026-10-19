/**
 * ShopEasy Checkout Controller
 * Integrates Paystack Inline Payments & Cash on Delivery
 */
const PAYSTACK_PUBLIC_KEY = "pk_test_PASTE_YOUR_TEST_KEY_HERE";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Route Guards
  const user = typeof Auth !== "undefined" ? Auth.current() : null;
  if (!user) {
    window.location.href = "login.html?redirect=checkout.html";
    return;
  }

  if (typeof Cart === "undefined" || Cart.items().length === 0) {
    window.location.href = "cart.html";
    return;
  }

  // 2. Pre-fill recipient fields
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  if (nameInput) nameInput.value = user.name || "";
  if (emailInput) emailInput.value = user.email || "";

  // 3. Render Order Summary
  const summaryEl = document.getElementById("summary");
  const items = Cart.items();
  const subtotal = Cart.total();
  const freeThreshold = 50000;
  const isFreeDelivery = subtotal >= freeThreshold;
  const deliveryFee = isFreeDelivery ? 0 : 2500;
  const grandTotal = subtotal + deliveryFee;

  if (summaryEl) {
    const itemLines = items.map(item => {
      const p = typeof products !== "undefined" ? products.find(prod => prod.id === item.id) : null;
      if (!p) return "";
      return `
        <div class="summary-row" style="align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border);">
          <div style="display: flex; gap: 10px; align-items: center;">
            <img src="${p.image}" alt="${UI.escape(p.name)}" style="width: 44px; height: 44px; border-radius: var(--radius-sm); object-fit: cover;">
            <div>
              <strong style="font-size: 0.95rem; color: var(--text);">${UI.escape(p.name)}</strong>
              <div style="font-size: 0.8rem; color: var(--text-muted);">Qty: ${item.qty} &times; ${UI.formatPrice(p.price)}</div>
            </div>
          </div>
          <span style="font-weight: 600; color: var(--text);">${UI.formatPrice(p.price * item.qty)}</span>
        </div>
      `;
    }).join("");

    summaryEl.innerHTML = `
      <div style="max-height: 280px; overflow-y: auto; margin-bottom: 14px;">
        ${itemLines}
      </div>
      <div class="summary-row">
        <span>Items Subtotal</span>
        <span>${UI.formatPrice(subtotal)}</span>
      </div>
      <div class="summary-row">
        <span>Shipping (${isFreeDelivery ? 'Threshold Met' : 'Standard Rate'})</span>
        <span style="color: var(--primary); font-weight: 700;">${isFreeDelivery ? 'FREE' : UI.formatPrice(deliveryFee)}</span>
      </div>
      <div class="summary-row total-row">
        <span>Total Due</span>
        <span style="color: var(--primary);">${UI.formatPrice(grandTotal)}</span>
      </div>
    `;
  }

  // 4. Save Order Function
  function saveOrder(paymentMethod, paymentStatus, paymentReference) {
    const orderItems = Cart.items().map(item => {
      const p = typeof products !== "undefined" ? products.find(prod => prod.id === item.id) : null;
      return {
        id: p ? p.id : item.id,
        name: p ? p.name : "Product #" + item.id,
        price: p ? p.price : 0,
        qty: item.qty
      };
    });

    const newOrder = {
      id: "SE-" + Math.floor(100000 + Math.random() * 900000),
      userId: user.id,
      items: orderItems,
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      total: grandTotal,
      date: new Date().toLocaleDateString("en-NG", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      paymentMethod: paymentMethod, // 'paystack' or 'cod'
      paymentStatus: paymentStatus, // 'paid' or 'pending'
      paymentRef: paymentReference || null,
      customer: {
        name: (document.getElementById("name").value || "").trim(),
        phone: (document.getElementById("phone").value || "").trim(),
        address: (document.getElementById("address").value || "").trim()
      }
    };

    const orders = store.get("orders", []);
    orders.push(newOrder);
    store.set("orders", orders);

    // Empty cart and redirect to profile page with celebration trigger
    Cart.clear();
    window.location.href = "profile.html?success=1";
  }

  // 5. Form Handling
  const checkoutForm = document.getElementById("checkout-form");
  const payMsg = document.getElementById("pay-msg");
  const placeBtn = document.getElementById("place-btn");

  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault();

      if (payMsg) {
        payMsg.style.display = "none";
        payMsg.textContent = "";
      }

      const methodChoice = document.querySelector('input[name="pay"]:checked');
      const method = methodChoice ? methodChoice.value : "cod";

      // A. Cash On Delivery
      if (method === "cod") {
        placeBtn.disabled = true;
        placeBtn.textContent = "Placing Your Order...";
        setTimeout(() => {
          saveOrder("cod", "pending", null);
        }, 400);
        return;
      }

      // B. Pay Online with Paystack
      if (method === "paystack") {
        // Check if key is still the default placeholder
        if (PAYSTACK_PUBLIC_KEY === "pk_test_PASTE_YOUR_TEST_KEY_HERE" || PAYSTACK_PUBLIC_KEY.includes("PASTE_YOUR")) {
          if (payMsg) {
            payMsg.style.display = "block";
            payMsg.style.background = "var(--terracotta-tint)";
            payMsg.style.color = "var(--terracotta)";
            payMsg.innerHTML = "⚠️ <strong>Paystack Key Required:</strong> Paste your test public key at the top of <code>js/checkout.js</code>, or choose <strong>Pay on Delivery</strong> to test the order flow immediately without a key.";
          }
          return;
        }

        if (typeof PaystackPop === "undefined") {
          if (payMsg) {
            payMsg.style.display = "block";
            payMsg.style.background = "var(--terracotta-tint)";
            payMsg.style.color = "var(--terracotta)";
            payMsg.textContent = "Paystack checkout library could not load. Please check your internet connection or choose Pay on Delivery.";
          }
          return;
        }

        placeBtn.disabled = true;
        placeBtn.textContent = "Launching Paystack...";

        try {
          const handler = PaystackPop.setup({
            key: PAYSTACK_PUBLIC_KEY,
            email: (emailInput ? emailInput.value : user.email).trim().toLowerCase(),
            amount: grandTotal * 100, // Paystack amount is in Kobo (100 Kobo = 1 Naira)
            currency: "NGN",
            ref: "SE-" + Date.now(),
            callback: function (response) {
              saveOrder("paystack", "paid", response.reference);
            },
            onClose: function () {
              placeBtn.disabled = false;
              placeBtn.textContent = "Place Order →";
              if (payMsg) {
                payMsg.style.display = "block";
                payMsg.style.background = "var(--sand)";
                payMsg.style.color = "var(--text)";
                payMsg.textContent = "Paystack window was closed. Your order has not been charged yet.";
              }
            }
          });

          handler.openIframe();
        } catch (err) {
          console.error("Paystack launch error:", err);
          placeBtn.disabled = false;
          placeBtn.textContent = "Place Order →";
          if (payMsg) {
            payMsg.style.display = "block";
            payMsg.style.background = "var(--terracotta-tint)";
            payMsg.style.color = "var(--terracotta)";
            payMsg.textContent = "Error initiating Paystack: " + err.message;
          }
        }
      }
    });
  }
});