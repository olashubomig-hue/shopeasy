/**
 * Demo Authentication System (simulated using localStorage)
 */
const Auth = {
  /**
   * Register a new demo user.
   * Checks for valid inputs, matching passwords, and duplicate email.
   */
  register(name, email, password, confirm) {
    const cleanName = (name || "").trim();
    const cleanEmail = (email || "").trim().toLowerCase();

    if (!cleanName) {
      return { ok: false, msg: "Please enter your full name." };
    }
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { ok: false, msg: "Please enter a valid email address." };
    }
    if (!password || password.length < 6) {
      return { ok: false, msg: "Password must be at least 6 characters." };
    }
    if (confirm !== undefined && password !== confirm) {
      return { ok: false, msg: "Passwords do not match." };
    }

    const users = store.get("users", []);
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { ok: false, msg: "An account with this email already exists." };
    }

    const newUser = {
      id: "USR-" + Date.now(),
      name: cleanName,
      email: cleanEmail,
      password: password,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    store.set("users", users);

    // Auto-login upon registration
    store.set("currentUser", {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    });

    return { ok: true, user: newUser };
  },

  /**
   * Login user with email and password.
   */
  login(email, password) {
    const cleanEmail = (email || "").trim().toLowerCase();
    const users = store.get("users", []);
    const user = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);

    if (!user) {
      return { ok: false, msg: "Invalid email or password. Please try again." };
    }

    store.set("currentUser", {
      id: user.id,
      name: user.name,
      email: user.email
    });

    return { ok: true, user };
  },

  /**
   * Log out current user and redirect to login page.
   */
  logout() {
    store.remove("currentUser");
    if (typeof UI !== "undefined" && UI.updateAuthLinks) {
      UI.updateAuthLinks();
    }
    window.location.href = "login.html";
  },

  /**
   * Get active logged in user profile, or null.
   */
  current() {
    return store.get("currentUser", null);
  },

  /**
   * Guard for protected pages (e.g. checkout, profile).
   */
  requireLogin(redirectUrl = "login.html") {
    if (!this.current()) {
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  },

  /**
   * Guard to prevent logged in users from visiting login/register.
   */
  redirectIfLoggedIn(target = "profile.html") {
    if (this.current()) {
      window.location.href = target;
      return true;
    }
    return false;
  }
};