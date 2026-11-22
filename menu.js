/* ===== Menu data (shared by student + admin pages) ===== */
/* Saved in the browser (localStorage "ll-menu"). Photos: assets/food/<short-title-with-dashes>.jpg */
(function () {
  /* Default items. c=category, s=short title, n=name, p=price, d=description, i=photo name, a=available */
  var DEFAULT = [
    { id: 1, c: "Rice Meals", s: "Chicken Meal", n: "House Special Chicken Meal", p: 95, d: "Crispy fried chicken with rice and gravy." },
    { id: 2, c: "Rice Meals", s: "Siomai Rice", n: "Pork Siomai Rice (4 pcs)", p: 65, d: "Four pieces of pork siomai over steamed rice." },
    { id: 3, c: "Rice Meals", s: "Sisig Rice", n: "Sizzling Pork Sisig Rice", p: 105, d: "Sizzling pork sisig on rice, topped with egg." },
    { id: 4, c: "Snacks", s: "Beef Burger", n: "Cheesy Beef Burger", p: 55, d: "Juicy beef patty with melted cheese in a soft bun." },
    { id: 5, c: "Snacks", s: "Clubhouse", n: "Clubhouse Sandwich & Fries", p: 75, d: "Triple-decker sandwich served with crispy fries." },
    { id: 6, c: "Drinks", s: "Iced Coffee", n: "Iced Caramel Macchiato (16oz)", p: 50, d: "Chilled iced caramel macchiato, 16oz." },
    { id: 7, c: "Drinks", s: "Mango Shake", n: "Fresh Mango Shake", p: 45, d: "Fresh mango blended smooth and cold." },
    { id: 8, c: "Desserts", s: "Mango Graham", n: "Mango Graham Float Cup", p: 40, d: "Layers of graham, cream and ripe mango in a cup." },
    { id: 9, c: "Rice Meals", s: "Honey Garlic", n: "Honey Garlic Chicken", p: 110, i: "honey-garlic-chicken", d: "Tender glazed chicken served with steamed jasmine rice and seasonal vegetables." }
  ];
  /* Load + save menu */
  function read() {
    try { var v = JSON.parse(localStorage.getItem("ll-menu")); if (v && v.length !== undefined) return v; } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT));
  }
  window.LL_MENU = read();
  window.llSaveMenu = function () { try { localStorage.setItem("ll-menu", JSON.stringify(window.LL_MENU)); } catch (e) {} };
  window.llReloadMenu = function () { var v = read(); window.LL_MENU.splice.apply(window.LL_MENU, [0, window.LL_MENU.length].concat(v)); };

  /* ===== Today's special ===== */
  function slug(x) { return x.i || x.s.toLowerCase().replace(/[^a-z0-9]+/g, "-"); }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function spId() {
    try { var v = localStorage.getItem("ll-special"); if (v !== null) return v === "none" ? null : +v; } catch (e) {}
    return 9;
  }
  window.llSpecial = function () {
    var id = spId();
    return window.LL_MENU.filter(function (x) { return x.id === id && x.a !== false; })[0] || null;
  };
  /* Today's menu list (special first) */
  window.llTodayMenu = function (limit) {
    var s = window.llSpecial();
    var rest = window.LL_MENU.filter(function (x) { return x.a !== false && (!s || x.id !== s.id); });
    var L = s ? [s].concat(rest) : rest;
    return limit ? L.slice(0, limit) : L;
  };
  /* Set special */
  window.llSetSpecial = function (v) { try { localStorage.setItem("ll-special", v); } catch (e) {} };
  /* Fill the special card on the page */
  window.llFillSpecial = function () {
    var s = window.llSpecial();
    var q = function (sel, fn) { [].forEach.call(document.querySelectorAll(sel), fn); };
    q("[data-sp-photo]", function (el) {
      el.innerHTML = s
        ? '<img src="assets/food/' + slug(s) + '.jpg" alt="" onerror="this.remove()" /><span class="tag">Today\'s special</span>'
        : '<span class="tag">Today\'s special</span><span>No special today</span>';
    });
    q('[data-sp="name"]', function (el) { el.textContent = s ? s.n : "No special today"; });
    q('[data-sp="desc"]', function (el) { el.textContent = s ? (s.d || "Freshly prepared at the canteen.") : "Check the menu for what is available today."; });
    q('[data-sp="chip"]', function (el) { el.textContent = s ? "Available" : "Not set"; el.className = "chip" + (s ? "" : " pending"); });
    q('[data-sp="price"]', function (el) { el.textContent = s ? "\u20b1" + s.p.toFixed(2) : "\u2014"; });
    q('[data-sp="mini"]', function (el) { el.textContent = s ? s.c + " \u00b7 \u20b1" + s.p.toFixed(2) : ""; });
  };
})();