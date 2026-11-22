(function () {
  /* ===== Access guard (role check) ===== */
  var need = document.body.dataset.role, me = {};
  try { me = JSON.parse(sessionStorage.getItem("ll-user") || "{}"); } catch (e) {}
  if (need && me.role !== need) {
    location.replace(me.role === "admin" ? "admin.html" : me.role === "student" ? "student.html" : "index.html");
    return;
  }
  /* ===== Demo reset (clears tray, orders, queue on load) ===== */
  try { ["ll-tray", "ll-orders", "ll-seq", "ll-admin-q"].forEach(function (k) { localStorage.removeItem(k); }); } catch (e) {}
  /* ===== Icon set (SVG symbols) ===== */
  var S = 'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  var I = {
    home: '<path d="m3 11 9-8 9 8M5 10v10h5v-6h4v6h5V10"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h10"/>',
    calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 15c2.5.6 3.5 2.4 3.5 5"/>',
    history: '<path d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4M12 8v4l3 2"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17v.1"/>',
    logout: '<path d="M9 4H5v16h4M15 8l4 4-4 4M19 12H9"/>',
    bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15L6 16ZM10 21h4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pin: '<path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>',
    id: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 10h4M7 14h6"/>',
    ticket: '<path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z"/><path d="M14 6v2m0 3v2m0 3v2"/>',
    basket: '<path d="M4 9h16l-1.5 9a2 2 0 0 1-2 1.6h-9a2 2 0 0 1-2-1.6L4 9ZM8 9l3-5M16 9l-3-5"/>',
    cap: '<path d="m3 8 9-5 9 5-9 5-9-5Z"/><path d="M6.5 10v5c3 2.5 8 2.5 11 0v-5"/>'
  };
  document.body.insertAdjacentHTML("afterbegin", '<svg width="0" height="0" style="position:absolute" aria-hidden="true">' +
    Object.keys(I).map(function (k) { return '<symbol id="i-' + k + '" viewBox="0 0 24 24" fill="none" ' + S + '>' + I[k] + '</symbol>'; }).join("") + "</svg>");

  /* ===== Dark / light theme ===== */
  var body = document.body, toggle = document.getElementById("theme-toggle");
  var moon = '<path d="M20 15.2A8.5 8.5 0 0 1 8.8 4a8.5 8.5 0 1 0 11.2 11.2Z" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>';
  var sun = '<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2.2"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>';
  function theme() {
    var d = body.classList.contains("dark"), l = d ? "Switch to light mode" : "Switch to dark mode";
    toggle.setAttribute("aria-label", l); toggle.title = l; toggle.setAttribute("aria-pressed", d);
    document.getElementById("theme-icon").innerHTML = d ? sun : moon;
  }
  try { if (localStorage.getItem("ll-theme") === "dark") body.classList.add("dark"); } catch (e) {}
  theme();
  toggle.addEventListener("click", function () {
    body.classList.toggle("dark");
    try { localStorage.setItem("ll-theme", body.classList.contains("dark") ? "dark" : "light"); } catch (e) {}
    theme();
  });

  /* ===== Signed-in user name + initials ===== */
  var u = {};
  try { u = JSON.parse(sessionStorage.getItem("ll-user") || "{}"); } catch (e) {}
  var name = null;
  if (u.email && !/@demo\.edu$/i.test(u.email)) {
    name = u.email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }
  if (name) {
    document.querySelectorAll("[data-name]").forEach(function (el) { el.textContent = name; });
    document.querySelectorAll("[data-initials]").forEach(function (el) {
      el.textContent = name.split(" ").slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();
    });
  }
  /* ===== Greeting + today's date ===== */
  var first = (document.querySelector("[data-name]") || {}).textContent || "";
  var h = new Date().getHours(), part = h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
  var g = document.getElementById("greet");
  if (g) g.textContent = "Good " + part + ", " + first.split(" ")[0] + "!";
  var d = document.getElementById("today-date");
  if (d) d.textContent = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  /* ===== Open / closed status ===== */
  var now = new Date(), hr = now.getHours() + now.getMinutes() / 60;
  var open = now.getDay() >= 1 && now.getDay() <= 6 && hr >= 8 && hr < 17;
  function set(id, t) { var el = document.getElementById(id); if (el) el.textContent = t; }
  set("open-title", open ? "Open now" : "Closed now");
  set("live-title", open ? "Cafeteria is open" : "Cafeteria is closed");
  document.querySelectorAll(".serving, .live").forEach(function (el) { el.classList.toggle("closed", !open); });
  ["open-dot", "live-dot"].forEach(function (id) {
    var el = document.getElementById(id); if (el && !open) el.style.background = "#ef4444";
  });

  /* ===== Nav + mobile drawer ===== */
  var app = document.getElementById("app");
  function drawer(open) { app.classList.toggle("open", open); }
  document.getElementById("burger").addEventListener("click", function () { drawer(true); });
  document.getElementById("scrim").addEventListener("click", function () { drawer(false); });
  document.querySelectorAll(".nav a").forEach(function (a) {
    a.addEventListener("click", function () {
      document.querySelectorAll(".nav a").forEach(function (x) { x.classList.remove("active"); });
      a.classList.add("active"); drawer(false);
    });
  });
  document.getElementById("logout").addEventListener("click", function () { try { sessionStorage.removeItem("ll-user"); } catch (e) {} });

  /* ===== Table filter + search ===== */
  var rows = document.querySelectorAll(".tr[data-status]");
  if (rows.length) {
    var filter = "all", q = document.getElementById("search"), pills = document.querySelectorAll(".pill");
    var apply = function () {
      var shown = 0, term = q.value.trim().toLowerCase();
      rows.forEach(function (r) {
        var ok = (filter === "all" || r.dataset.status === filter) && r.textContent.toLowerCase().indexOf(term) > -1;
        r.style.display = ok ? "" : "none"; if (ok) shown++;
      });
      document.getElementById("empty").style.display = shown ? "none" : "block";
    };
    pills.forEach(function (p) {
      p.addEventListener("click", function () {
        filter = p.dataset.filter;
        pills.forEach(function (x) { x.classList.toggle("active", x === p); });
        apply();
      });
    });
    q.addEventListener("input", apply);
  }
})();