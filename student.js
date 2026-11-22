(function () {
  /* ===== Shortcuts + helpers ===== */
  var M = window.LL_MENU;
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return document.querySelectorAll(s); };
  var peso = function (n) { return "₱" + n.toFixed(2); };
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var byId = function (id) { return M.filter(function (m) { return m.id == id; })[0]; };
  function load(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  /* Save to browser */
  function save() {
    try {
      localStorage.setItem("ll-tray", JSON.stringify(tray));
      localStorage.setItem("ll-orders", JSON.stringify(orders));
      localStorage.setItem("ll-seq", JSON.stringify(seq));
    } catch (e) {}
  }
  /* ===== State (tray, orders, queue number) ===== */
  var tray = load("ll-tray", {}), orders = load("ll-orders", []), seq = load("ll-seq", 40), cat = "All Items", term = "";

  /* ===== Drawing ===== */
  /* Food card */
  function card(m) {
    var slug = m.i || m.s.toLowerCase().replace(/[^a-z0-9]+/g, "-"), sp = window.llSpecial(), isSp = sp && sp.id === m.id;
    return '<article class="food' + (m.a === false ? " off" : "") + '"><div class="photo"><img src="assets/food/' + slug + '.jpg" alt="" onerror="this.remove()" /><span>' + esc(m.s) + '</span>' + (isSp ? '<span class="tag">Today\'s special</span>' : '') + '</div>' +
      '<div class="food-body"><span class="cat">' + m.c + '</span><b>' + esc(m.n) + '</b>' +
      '<div class="food-foot"><strong>' + peso(m.p) + '</strong>' + (m.a === false ? '<button class="add" type="button" disabled>Sold out</button>' : '<button class="add" type="button" data-id="' + m.id + '">+ Add</button>') + '</div></div></article>';
  }
  /* Food grid */
  function renderFoods() {
    $("#quick").innerHTML = window.llTodayMenu(4).map(card).join("");
    var list = M.filter(function (m) {
      return (cat === "All Items" || m.c === cat) && (m.n + " " + m.c).toLowerCase().indexOf(term) > -1;
    });
    $("#foods").innerHTML = list.length ? list.map(card).join("") : '<p class="muted-c">No items found.</p>';
  }
  /* Food tray */
  function renderTray() {
    Object.keys(tray).forEach(function (id) { var m = byId(id); if (!m || m.a === false) delete tray[id]; });
    var L = Object.keys(tray).map(function (id) { var m = byId(id); return m ? { m: m, q: tray[id] } : null; }).filter(Boolean), n = 0, t = 0;
    L.forEach(function (l) { n += l.q; t += l.q * l.m.p; });
    $("#tray-list").innerHTML = L.length ? L.map(function (l) {
      return '<div class="t-row"><span><b>' + esc(l.m.n) + '</b><br /><small>' + peso(l.m.p) + '</small></span><span class="qty">' +
        '<button type="button" data-d="-1" data-id="' + l.m.id + '" aria-label="Remove one">−</button><i>' + l.q + '</i>' +
        '<button type="button" data-d="1" data-id="' + l.m.id + '" aria-label="Add one">+</button></span></div>';
    }).join("") : '<p class="muted-c">Your tray is empty.</p>';
    $("#tray-count").textContent = n + (n === 1 ? " item" : " items");
    $("#total").textContent = peso(t);
    $("#place").disabled = !n;
    var b = $("#nav-count"); b.textContent = n; b.hidden = !n;
  }
  /* Recent orders */
  function renderOrders() {
    $("#orders").innerHTML = orders.length ? orders.slice(0, 5).map(function (o) {
      return '<div class="list-row"><div class="grow"><b>' + o.no + ' · ' + o.id + '</b> <span class="chip ' + (o.status === "Picked up" ? "line" : o.status === "Ready" ? "" : "pending") + '">' + o.status + '</span>' +
        '<small>' + esc(o.items.map(function (i) { return i.q + "× " + i.n; }).join(", ")) + '</small></div><strong>' + peso(o.total) + '</strong></div>';
    }).join("") : '<p class="muted-c">No pre-orders yet. Your recent orders will show up here.</p>';
  }
  /* Queue ticket */
  function renderQueue() {
    var o = orders.filter(function (x) { return x.status !== "Picked up"; })[0];
    var head = '<div class="t-head"><span class="pillbadge">Mobile queue pass</span><h2>Canteen pickup ticket</h2></div>';
    if (!o) {
      $("#ticket").innerHTML = head + '<div class="t-body empty-q"><span class="ico big"><svg class="i"><use href="#i-ticket"/></svg></span><h3>No active pickup token</h3>' +
        '<p class="muted-c">Place a canteen order to track your live queue position here.</p><a class="cta" href="#menu">Browse food menu</a></div>';
      return;
    }
    var num = parseInt(o.no.slice(2), 10), now = "A-" + ("000" + (num - 3)).slice(-3);
    $("#ticket").innerHTML = head + '<div class="t-body"><span class="eyebrow">Your queue number</span><div class="qnum">' + o.no + '</div>' +
      '<span class="chip ' + (o.status === "Ready" ? "" : "pending") + '">' + (o.status === "Ready" ? "Ready for pickup" : o.status) + '</span><p class="muted-c">' + (o.status === "Ready" ? "Your order is ready. Please head to the counter!" : 'Now serving <b>' + now + '</b> · about 2 orders ahead of you') + '</p>' +
      '<div class="t-lines"><div><span>Order</span><b>' + o.id + '</b></div><div><span>Pickup slot</span><b>' + esc(o.slot) + '</b></div>' +
      o.items.map(function (i) { return '<div><span>' + i.q + '× ' + esc(i.n) + '</span><span>' + peso(i.q * i.p) + '</span></div>'; }).join("") +
      (o.note ? '<div><span>Note</span><span>' + esc(o.note) + '</span></div>' : "") +
      '<div><b>Total</b><b>' + peso(o.total) + '</b></div></div>' +
      '<button class="cta" id="picked" type="button">I\'ve picked up my order</button></div>';
  }
  /* Redraw everything */
  function all() { renderFoods(); renderTray(); renderOrders(); renderQueue(); window.llFillSpecial(); }

  /* ===== Toast + tray quantity ===== */
  var tt;
  function toast(t) {
    var el = $("#toast"); el.textContent = t; el.hidden = false;
    clearTimeout(tt); tt = setTimeout(function () { el.hidden = true; }, 1600);
  }
  function change(id, d) {
    tray[id] = (tray[id] || 0) + d;
    if (tray[id] <= 0) delete tray[id];
    save(); renderTray();
  }

  /* ===== Clicks: add, quantity, category, picked up ===== */
  document.addEventListener("click", function (e) {
    var a = e.target.closest(".add"), q = e.target.closest(".qty button"), p = e.target.closest(".pill[data-cat]");
    if (a) { change(a.dataset.id, 1); toast("Added to your tray"); }
    else if (q) change(q.dataset.id, +q.dataset.d);
    else if (p) {
      cat = p.dataset.cat;
      $$(".pill[data-cat]").forEach(function (x) { x.classList.toggle("active", x === p); });
      renderFoods();
    } else if (e.target.closest("#picked")) {
      orders = load("ll-orders", orders);
      var cur = orders.filter(function (x) { return x.status !== "Picked up"; })[0];
      if (cur) { cur.status = "Picked up"; save(); }
      renderOrders(); renderQueue(); toast("Pickup confirmed. Enjoy your meal!");
    }
  });
  /* ===== Menu search ===== */
  $("#msearch").addEventListener("input", function () { term = this.value.trim().toLowerCase(); renderFoods(); });
  /* ===== Place pre-order ===== */
  $("#place").addEventListener("click", function () {
    var items = Object.keys(tray).map(function (id) { var m = byId(id); return m && m.a !== false ? { n: m.n, q: tray[id], p: m.p } : null; }).filter(Boolean);
    if (!items.length) return;
    seq++;
    orders.unshift({
      no: "A-" + ("000" + seq).slice(-3), id: "ORD-" + (9860 + seq), items: items,
      total: items.reduce(function (s, i) { return s + i.q * i.p; }, 0),
      slot: $("#slot").value, note: $("#note").value.trim(), status: "Preparing", who: ($("[data-name]") || {}).textContent
    });
    tray = {}; $("#note").value = ""; save(); all();
    location.hash = "queue";
  });

  /* ===== Page switching (#overview, #menu, #queue) ===== */
  var titles = { overview: "Student portal", menu: "Food menu", queue: "Queue ticket" };
  function route() {
    var v = (location.hash || "#overview").slice(1);
    if (!titles[v]) v = "overview";
    $$(".view").forEach(function (el) { el.hidden = el.id !== "v-" + v; });
    $$(".nav a").forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + v); });
    $("#top-sub").textContent = titles[v];
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  /* ===== Live sync with admin page ===== */
  window.addEventListener("storage", function (e) {
    if (e.key === "ll-menu" || e.key === "ll-special") { window.llReloadMenu(); renderFoods(); renderTray(); window.llFillSpecial(); return; }
    if (e.key !== "ll-orders") return;
    var had = orders.filter(function (x) { return x.status !== "Picked up"; })[0];
    orders = load("ll-orders", []);
    var cur = had && orders.filter(function (x) { return x.no === had.no; })[0];
    renderOrders(); renderQueue();
    if (cur && cur.status === "Picked up") toast("The counter confirmed your pickup. Enjoy your meal!");
    else if (cur && cur.status === "Ready" && had.status !== "Ready") toast("Your order is ready for pickup!");
  });
  /* ===== Pickup time slots ===== */
  (function () {
    function fmt(m) { var h = Math.floor(m / 60), ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12; return h + ":" + ("0" + (m % 60)).slice(-2) + " " + ap; }
    var n = new Date(), mins = n.getHours() * 60 + n.getMinutes(), html = "", chosen = false;
    for (var m = 480; m < 1020; m += 30) {
      var pick = !chosen && m >= mins; if (pick) chosen = true;
      html += "<option" + (pick ? " selected" : "") + ">" + fmt(m) + " – " + fmt(m + 30) + "</option>";
    }
    $("#slot").innerHTML = html;
  })();
  /* ===== Upcoming menu dates (next two open days) ===== */
  (function () {
    var d = new Date(), wk = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    [0, 1].forEach(function (i) {
      do { d.setDate(d.getDate() + 1); } while (d.getDay() === 0);
      var el = document.querySelector('[data-up="' + i + '"]');
      if (el) el.innerHTML = "<small>" + wk[d.getDay()] + "</small>" + d.getDate();
    });
  })();
  /* ===== Start ===== */
  all(); route();
})();