/* ===== TEK YERDEN AYAR ===== */
const CONFIG = {
  whatsapp: "905408182828",               // WhatsApp numarası (ülke kodu ile)
  poweredUrl: "https://fahrettingroup.net"  // "Powered by Fahrettin Group" bağlantısı
};
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const waLink = (t) => "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(t);
const HELLO = "Merhaba, Asil Sigorta web sitesinden yazıyorum. Sigorta teklifi almak istiyorum.";

document.querySelectorAll("[data-wa]").forEach((a) => { a.href = waLink(HELLO); a.target = "_blank"; a.rel = "noopener"; });
document.getElementById("powered").href = CONFIG.poweredUrl;

/* ---- açılış animasyonu (oturumda bir kez) ---- */
const intro = document.getElementById("intro");
let seen = false;
try { seen = sessionStorage.getItem("asil-intro") === "1"; } catch (e) {}
function start() {
  document.body.classList.remove("locked");
  document.documentElement.classList.add("ready");
  document.body.classList.add("ready");
}
if (!intro || reduce || seen) {
  if (intro) intro.remove();
  start();
} else {
  intro.querySelectorAll(".word span").forEach((s, i) => (s.style.animationDelay = 0.45 + i * 0.045 + "s"));
  setTimeout(() => {
    flyLogo();
    intro.classList.add("out");
    start();
    try { sessionStorage.setItem("asil-intro", "1"); } catch (e) {}
    setTimeout(() => intro.remove(), 1100);
  }, 2100);
}

/* açılıştaki logo, perde kalkarken küredeki yerine uçar */
function flyLogo() {
  const from = intro.querySelector(".tile"), to = document.querySelector(".orb-logo");
  if (!from || !to) return;
  const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
  if (b.bottom < 0 || b.top > innerHeight) return;
  document.body.classList.add("wait-logo");
  const f = document.createElement("div");
  f.className = "fly";
  f.innerHTML = '<img src="img/logo-siyah.png" alt="">';
  Object.assign(f.style, { left: a.left + "px", top: a.top + "px", width: a.width + "px", height: a.height + "px" });
  document.body.appendChild(f);
  from.style.visibility = "hidden";
  requestAnimationFrame(() => requestAnimationFrame(() => {
    Object.assign(f.style, { left: b.left + "px", top: b.top + "px", width: b.width + "px", height: b.height + "px", borderRadius: b.width * 0.28 + "px" });
  }));
  setTimeout(() => { document.body.classList.remove("wait-logo"); f.style.opacity = "0"; setTimeout(() => f.remove(), 300); }, 1150);
}

/* ---- dönen kelime ---- */
const words = document.querySelectorAll(".rot b");
if (words.length && !reduce) {
  let k = 0;
  setInterval(() => {
    const cur = words[k]; k = (k + 1) % words.length; const nx = words[k];
    cur.classList.remove("on"); cur.classList.add("off");
    nx.classList.remove("off"); nx.classList.add("on");
    setTimeout(() => cur.classList.remove("off"), 800);
  }, 2200);
}

/* ---- formlar ---- */
document.querySelectorAll("form[data-form]").forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const text = "Merhaba, sigorta teklifi almak istiyorum.\n" +
      "Ad Soyad: " + String(f.get("ad")).trim() + "\n" +
      "Telefon: " + String(f.get("tel")).trim() + "\n" +
      "Sigorta türü: " + f.get("tur") + "\n" +
      "Not: " + (String(f.get("not") || "").trim() || "-");
    const w = window.open(waLink(text), "_blank");
    if (w) w.opener = null; else window.location.href = waLink(text);
  });
});
document.querySelectorAll("[data-pick]").forEach((a) => a.addEventListener("click", () => {
  const r = document.querySelector('input[name="tur"][value="' + a.dataset.pick + '"]');
  if (r) r.checked = true;
}));

/* ---- mobil menü ---- */
const burger = document.querySelector(".burger"), menu = document.getElementById("menu");
burger.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Menüyü kapat" : "Menüyü aç");
});
function closeMenu() { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); burger.setAttribute("aria-label", "Menüyü aç"); }
menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.classList.contains("open")) { closeMenu(); burger.focus(); } });

/* ---- kaydırınca belirme ---- */
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (e.isIntersecting) { const t = e.target; t.classList.add("in"); io.unobserve(t); setTimeout(() => (t.style.transitionDelay = ""), 1300); }
}), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
document.querySelectorAll(".rv").forEach((el, i) => { el.style.transitionDelay = (i % 3) * 90 + "ms"; io.observe(el); });

/* ---- kaydırma: ilerleme çubuğu, adım çizgisi, "neden biz" vurgusu ---- */
const root = document.documentElement, steps = document.getElementById("steps");
const whyItems = document.querySelectorAll(".why-list li"), stepItems = steps.querySelectorAll("li");
function onScroll() {
  const max = root.scrollHeight - innerHeight;
  root.style.setProperty("--p", max > 0 ? scrollY / max : 0);
  const r = steps.getBoundingClientRect();
  const sp = Math.min(1, Math.max(0, (innerHeight * 0.8 - r.top) / (r.height + innerHeight * 0.3)));
  steps.style.setProperty("--sp", sp);
  stepItems.forEach((li, i) => li.classList.toggle("lit", sp > 0 && sp >= i / (stepItems.length - 1) - 0.02));
  const mid = innerHeight * 0.5;
  whyItems.forEach((li) => { const b = li.getBoundingClientRect(); li.classList.toggle("lit", b.top < mid && b.bottom > mid); });
}
addEventListener("scroll", onScroll, { passive: true }); onScroll();

/* ---- imleç: ışık, küre, kart eğimi, mıknatıs düğmeler ---- */
const fine = window.matchMedia("(pointer: fine)").matches;
if (fine && !reduce) {
  const fx = document.querySelector(".fx"), orb = document.querySelector(".orb");
  addEventListener("pointermove", (e) => {
    fx.style.setProperty("--cx", e.clientX + "px"); fx.style.setProperty("--cy", e.clientY + "px");
    if (orb) {
      orb.style.setProperty("--rx", ((e.clientX / innerWidth) - 0.5) * 24 + "deg");
      orb.style.setProperty("--ry", -((e.clientY / innerHeight) - 0.5) * 24 + "deg");
    }
  }, { passive: true });
  document.querySelectorAll("[data-tilt]").forEach((c) => {
    c.addEventListener("pointermove", (e) => {
      const b = c.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
      c.style.setProperty("--mx", x * 100 + "%"); c.style.setProperty("--my", y * 100 + "%");
      c.style.transform = "perspective(900px) rotateX(" + (0.5 - y) * 8 + "deg) rotateY(" + (x - 0.5) * 8 + "deg) translateY(-4px)";
    });
    c.addEventListener("pointerleave", () => (c.style.transform = ""));
  });
  document.querySelectorAll("[data-mag]").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.transform = "translate(" + (e.clientX - r.left - r.width / 2) * 0.18 + "px," + (e.clientY - r.top - r.height / 2) * 0.25 + "px)";
    });
    b.addEventListener("pointerleave", () => (b.style.transform = ""));
  });
}

/* ---- Instagram telefonu: akış kayar, kalp atar ---- */
const posts = document.getElementById("posts");
if (posts) {
  const clock = document.querySelector("[data-clock]");
  const d = new Date(); clock.textContent = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  const items = posts.querySelectorAll(".post");
  let n = 0;
  const like = (p) => {
    const h = p.querySelector(".heart"), b = p.querySelector(".burst");
    b.classList.remove("go"); void b.offsetWidth; b.classList.add("go");
    h.classList.add("on");
  };
  items.forEach((p) => p.querySelector(".pimg").addEventListener("dblclick", () => like(p)));
  if (!reduce) {
    setInterval(() => {
      n = (n + 1) % items.length;
      posts.style.transform = "translateY(-" + items[n].offsetTop + "px)";
      setTimeout(() => like(items[n]), 900);
    }, 3200);
  }
}
