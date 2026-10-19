/**
 * Cart Manager with LocalStorage persistence and navbar badge sync.
 */
const Cart = {
  items() {
    return store.get("cart", []);
  },

  add(id, qty = 1, openDrawer = true) {
    const pId = Number(id);
    const cart = this.items();
    const existing = cart.find(item => item.id === pId);

    // Find product to check stock
    const product = typeof products !== "undefined" ? products.find(p => p.id === pId) : null;
    const maxStock = product ? product.stock : 999;

    if (existing) {
      existing.qty = Math.min(existing.qty + qty, maxStock);
    } else {
      cart.push({ id: pId, qty: Math.min(qty, maxStock) });
    }

    store.set("cart", cart);

    if (typeof UI !== "undefined") {
      if (UI.updateCartCount) UI.updateCartCount(true); // trigger bounce
      if (UI.renderCartDrawer) UI.renderCartDrawer();
      if (openDrawer && UI.openCartDrawer) UI.openCartDrawer();
    }
  },

  setQty(id, qty) {
    const pId = Number(id);
    let cart = this.items();

    if (qty <= 0) {
      cart = cart.filter(item => item.id !== pId);
    } else {
      const product = typeof products !== "undefined" ? products.find(p => p.id === pId) : null;
      const maxStock = product ? product.stock : 999;
      const targetQty = Math.min(qty, maxStock);

      cart = cart.map(item => (item.id === pId ? { ...item, qty: targetQty } : item));
    }

    store.set("cart", cart);

    if (typeof UI !== "undefined") {
      if (UI.updateCartCount) UI.updateCartCount(false);
      if (UI.renderCartDrawer) UI.renderCartDrawer();
    }
  },

  remove(id) {
    this.setQty(id, 0);
  },

  clear() {
    store.set("cart", []);
    if (typeof UI !== "undefined") {
      if (UI.updateCartCount) UI.updateCartCount(false);
      if (UI.renderCartDrawer) UI.renderCartDrawer();
    }
  },

  total() {
    if (typeof products === "undefined") return 0;
    return this.items().reduce((sum, item) => {
      const p = products.find(p => p.id === item.id);
      return sum + (p ? p.price * item.qty : 0);
    }, 0);
  },

  count() {
    return this.items().reduce((sum, item) => sum + item.qty, 0);
  },

  has(id) {
    const pId = Number(id);
    return this.items().some(item => item.id === pId);
  }
};