(function () {
  /* ===== Shortcuts ===== */
  var $ = function (s) { return document.querySelector(s); }, $$ = function (s) { return document.querySelectorAll(s); };
  function store(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }

  /* ===== Menu management (add / edit / hide / remove) ===== */
  var M = window.LL_MENU;
  /* Helpers */
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function find(id) { return M.filter(function (m) { return m.id == id; })[0]; }
  /* Draw menu table + right-side menu */
  function renderMenu() {
    var sp = window.llSpecial();
    $("#menu-rows").innerHTML = M.length ? M.map(function (m) {
      var on = m.a !== false;
      return '<div class="tr mi"><div><b>' + esc(m.n) + '</b><small>' + m.c + ' · ₱' + m.p.toFixed(2) + (sp && sp.id === m.id ? ' · ★ Today\'s special' : '') + '</small></div>' +
        '<label class="sw"><input type="checkbox" data-av="' + m.id + '"' + (on ? " checked" : "") + ' /><span class="slider"></span><em>' + (on ? "Available" : "Unavailable") + '</em></label>' +
        '<div class="acts"><button class="act ghost" type="button" data-star="' + m.id + '"' + (on ? '' : ' disabled') + '>' + (sp && sp.id === m.id ? '\u2605 Special' : '\u2606 Make special') + '</button><button class="act ghost" type="button" data-edit="' + m.id + '">Edit</button><button class="act danger" type="button" data-del="' + m.id + '">Remove</button></div></div>';
    }).join("") : '<p class="muted-c" style="padding:26px;text-align:center">No menu items yet. Add one to get started.</p>';
    $("#quick").innerHTML = window.llTodayMenu(4).map(function (m) {
      var slug = m.i || m.s.toLowerCase().replace(/[^a-z0-9]+/g, "-"), on = m.a !== false;
      return '<article class="food' + (on ? "" : " off") + '"><div class="photo"><img src="assets/food/' + slug + '.jpg" alt="" onerror="this.remove()" /><span>' + esc(m.s) + '</span>' + (sp && sp.id === m.id ? '<span class="tag">Today\'s special</span>' : '') + '</div><div class="food-body"><span class="cat">' + m.c + '</span><b>' + esc(m.n) + '</b>' +
        '<div class="food-foot"><strong>₱' + m.p.toFixed(2) + '</strong><span class="chip' + (on ? "" : " pending") + '">' + (on ? "Available" : "Unavailable") + '</span></div></div></article>';
    }).join("");
    window.llFillSpecial(); fillPicker();
  }
  /* Special dropdown options */
  function fillPicker() {
    var sel = $("#sp-select"); if (!sel) return;
    var cur = window.llSpecial();
    sel.innerHTML = '<option value="none">No special today</option>' + M.filter(function (m) { return m.a !== false; }).map(function (m) { return '<option value="' + m.id + '">' + esc(m.n) + '</option>'; }).join("");
    sel.value = cur ? String(cur.id) : "none";
  }
  /* Save + redraw */
  function persist() { window.llSaveMenu(); renderMenu(); }
  /* Add / edit dialog */
  var dlg = $("#item-dlg"), editing = null;
  function openDlg(m) {
    editing = m || null;
    $("#dlg-title").textContent = m ? "Edit menu item" : "Add menu item";
    $("#f-name").value = m ? m.n : ""; $("#f-type").value = m ? m.c : "Rice Meals";
    $("#f-price").value = m ? m.p : ""; $("#f-desc").value = m ? m.d || "" : ""; $("#f-avail").checked = m ? m.a !== false : true;
    dlg.showModal();
  }
  /* Save item form */
  $("#item-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var n = $("#f-name").value.trim(), p = parseFloat($("#f-price").value);
    if (!n || isNaN(p) || p < 0) return;
    var short = n.length > 16 ? n.split(" ").slice(0, 2).join(" ") : n;
    if (editing) {
      if (editing.n !== n) { editing.n = n; editing.s = short; delete editing.i; }
      editing.d = $("#f-desc").value.trim(); editing.c = $("#f-type").value; editing.p = p; editing.a = $("#f-avail").checked;
    } else {
      M.push({ id: M.reduce(function (mx, m) { return Math.max(mx, m.id); }, 0) + 1, c: $("#f-type").value, s: short, n: n, p: p, d: $("#f-desc").value.trim(), a: $("#f-avail").checked });
    }
    persist(); dlg.close(); toast(editing ? "Item updated" : "Item added");
  });
  $("#f-cancel").addEventListener("click", function () { dlg.close(); });
  /* Menu buttons: add, special, edit, remove */
  document.addEventListener("click", function (e) {
    var ed = e.target.closest("[data-edit]"), dl = e.target.closest("[data-del]"), st = e.target.closest("[data-star]");
    if (e.target.closest("#add-item")) openDlg(null);
    else if (st) {
      var sm = find(st.dataset.star), cur = window.llSpecial();
      if (cur && cur.id === sm.id) { window.llSetSpecial("none"); renderMenu(); toast("Today's special cleared"); }
      else { window.llSetSpecial(sm.id); renderMenu(); toast(sm.n + " is now today's special"); }
    }
    else if (ed) openDlg(find(ed.dataset.edit));
    else if (dl) {
      var m = find(dl.dataset.del);
      if (m && confirm("Remove \u201c" + m.n + "\u201d from the menu? Students will no longer see it.")) { M.splice(M.indexOf(m), 1); persist(); toast(m.n + " removed"); }
    }
  });
  /* Special picker + availability switch */
  document.addEventListener("change", function (e) {
    if (e.target.id === "sp-select") { window.llSetSpecial(e.target.value); renderMenu(); var c = window.llSpecial(); toast(c ? c.n + " is now today's special" : "Today's special cleared"); return; }
    var t = e.target.closest("[data-av]");
    if (t) { var m = find(t.dataset.av); m.a = t.checked; persist(); toast(m.n + (m.a ? " is now available" : " is now unavailable")); }
  });
  renderMenu();

  /* ===== Toast message ===== */
  var tt;
  function toast(t) {
    var el = $("#toast"); el.textContent = t; el.hidden = false;
    clearTimeout(tt); tt = setTimeout(function () { el.hidden = true; }, 2200);
  }

  /* ===== Queue (serving -> ready -> picked up) ===== */
  /* Demo orders */
  var DEMO = [
    { no: "A-033", t: 75, name: "Paolo Garcia", id: "2024-02300", items: "1× Clubhouse Sandwich", st: "picked" },
    { no: "A-034", t: 95, name: "Sofia Villanueva", id: "2022-00977", items: "1× Chicken Meal", st: "picked" },
    { no: "A-035", t: 110, name: "Jamie Mendoza", id: "2023-01482", items: "1× Honey Garlic Chicken", st: "picked" },
    { no: "A-036", t: 55, name: "Daniel Cruz", id: "2023-01120", items: "1× Beef Burger", st: "ready" },
    { no: "A-037", t: 90, name: "Bianca Santos", id: "2021-00452", items: "1× Mango Graham, 1× Iced Coffee", st: "ready" },
    { no: "A-038", t: 105, name: "Alyssa Reyes", id: "2022-00841", items: "1× Sisig Rice", st: "serving" },
    { no: "A-039", t: 130, name: "Marcus Lim", id: "2024-02119", items: "2× Siomai Rice", st: "serving" }
  ];
  /* Status names + labels */
  var MAP = { Preparing: "serving", Ready: "ready", "Picked up": "picked" }, BACK = { serving: "Preparing", ready: "Ready", picked: "Picked up" };
  var LABEL = { serving: "Serving", ready: "Ready for pickup", picked: "Picked up" }, CHIP = { serving: "chip blue", ready: "chip", picked: "chip line" };
  var LIMIT = 6; /* tickets per column */
  var Q = [], filter = "all", term = "";
  /* Build queue (demo + student orders) */
  function build() {
    var saved = store("ll-admin-q", {});
    Q = DEMO.map(function (d) { return { no: d.no, t: d.t, name: d.name, id: d.id, items: d.items, st: saved[d.no] || d.st }; });
    store("ll-orders", []).forEach(function (o) {
      Q.push({ no: o.no, t: o.total || 0, name: o.who || "Student", id: o.id, items: o.items.map(function (i) { return i.q + "× " + i.n; }).join(", "), st: MAP[o.status] || "serving" });
    });
    Q.sort(function (a, b) { return a.no < b.no ? -1 : 1; });
  }
  /* Initials */
  function ini(n) { return n.split(" ").map(function (w) { return w[0]; }).slice(0, 2).join("").toUpperCase(); }
  /* Update stat cards */
  function stats() {
    var n = Q.length, c = function (s) { return Q.filter(function (q) { return q.st === s; }).length; };
    var sales = Q.reduce(function (s, q) { return s + (q.t || 0); }, 0);
    var set = function (id, t) { var el = $("#" + id); if (el) el.textContent = t; };
    set("st-orders", n); set("st-orders-chip", c("picked") + " picked up");
    set("st-serving", c("serving")); set("st-ready", c("ready"));
    set("st-sales", "\u20b1" + sales.toLocaleString("en-US"));
    set("st-sales-chip", "Avg \u20b1" + (n ? Math.round(sales / n) : 0) + " / order");
  }
  /* Draw table + board */
  function render() {
    stats();
    var list = Q.slice().reverse().filter(function (q) {
      return (filter === "all" || q.st === filter) && (q.name + " " + q.no + " " + q.items).toLowerCase().indexOf(term) > -1;
    });
    list = list.slice(0, LIMIT);
    $("#qrows").innerHTML = list.length ? list.map(function (q, i) {
      return '<div class="tr q"><div class="person"><span class="avatar a' + (i % 4 + 1) + '">' + ini(q.name) + '</span><span><b>' + q.name + '</b><small>' + q.id + '</small></span></div>' +
        '<div class="tk"><b>' + q.no + '</b><small>' + q.items + '</small></div><span><span class="' + CHIP[q.st] + '">' + LABEL[q.st] + '</span></span></div>';
    }).join("") : '<p class="muted-c" style="padding:26px;text-align:center">No orders in the queue.</p>';
    ["serving", "ready", "picked"].forEach(function (s) {
      var L = Q.filter(function (q) { return q.st === s; });
      if (s === "picked") L.reverse();
      $("#n-" + s).textContent = L.length;
      $("#b-" + s).innerHTML = L.length ? L.slice(0, LIMIT).map(function (q) {
        var btn = s === "picked" ? "" : '<button class="act" type="button" data-no="' + q.no + '" data-to="' + (s === "serving" ? "ready" : "picked") + '">' + (s === "serving" ? "Mark ready" : "Picked up") + '</button>';
        return '<div class="tk-card"><span class="tk-no">' + q.no + '</span><div class="grow">' + q.name + '<small>' + q.items + '</small></div>' + btn + '</div>';
      }).join("") : '<p class="muted-c" style="padding:22px 0;text-align:center">Nothing here.</p>';
    });
  }
  /* Queue buttons + filter pills */
  document.addEventListener("click", function (e) {
    var b = e.target.closest(".act"), p = e.target.closest(".pill[data-filter]");
    if (b) {
      var saved = store("ll-admin-q", {}), orders = store("ll-orders", []);
      var done = orders.filter(function (o) { return o.no === b.dataset.no && o.status === "Picked up"; })[0];
      if (done && b.dataset.to === "picked") { build(); render(); toast(b.dataset.no + " was already confirmed as picked up"); return; }
      var q = Q.filter(function (x) { return x.no === b.dataset.no; })[0]; q.st = b.dataset.to;
      saved[q.no] = q.st;
      orders.forEach(function (o) { if (o.no === q.no) o.status = BACK[q.st]; });
      try { localStorage.setItem("ll-admin-q", JSON.stringify(saved)); localStorage.setItem("ll-orders", JSON.stringify(orders)); } catch (er) {}
      render();
      if (q.st === "picked") toast(q.no + " confirmed as picked up");
    } else if (p) {
      filter = p.dataset.filter;
      $$(".pill[data-filter]").forEach(function (x) { x.classList.toggle("active", x === p); });
      render();
    }
  });
  /* Search box */
  $("#search").addEventListener("input", function () { term = this.value.trim().toLowerCase(); render(); });
  /* Live sync with student page */
  window.addEventListener("storage", function (e) {
    if (e.key !== "ll-orders") return;
    var before = {}; Q.forEach(function (q) { before[q.no] = q.st; });
    build(); render();
    Q.forEach(function (q) { if (q.st === "picked" && before[q.no] && before[q.no] !== "picked") toast(q.no + " was confirmed as picked up by the student"); });
  });
  /* Start queue */
  build(); render();

  /* ===== Settings (demo only) ===== */
  $("#save").addEventListener("click", function () { toast("Settings saved"); });

  /* ===== Page switching (#overview, #queue, #menu, #settings) ===== */
  var titles = { overview: "Cafeteria operations", queue: "Queue", menu: "Today's menu", settings: "Settings" };
  function route() {
    var v = (location.hash || "#overview").slice(1);
    if (!titles[v]) v = "overview";
    $$(".view").forEach(function (el) { el.hidden = el.id !== "v-" + v; });
    $$(".nav a").forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + v); });
    $("#top-sub").textContent = titles[v];
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  route();
})();