/* ===== TEK YERDEN AYAR: gerçek bilgileri burada değiştirin ===== */
const CONFIG = {
  whatsapp: "905000000000",       // ÖRNEK: ülke kodu ile, + ve boşluk olmadan
  phoneShow: "0500 000 00 00",    // ÖRNEK: sitede görünen telefon
  poweredUrl: "https://envarsigorta.com" // "Powered by Fahrettin Group" tıklanınca gidecek adres
};

const waLink = (text) => "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(text);
const HELLO = "Merhaba, Asil Sigorta web sitesinden yazıyorum. Sigorta teklifi almak istiyorum.";

document.querySelectorAll("[data-wa]").forEach((a) => {
  a.href = waLink(HELLO); a.target = "_blank"; a.rel = "noopener";
});
document.querySelectorAll("[data-phone]").forEach((el) => (el.textContent = CONFIG.phoneShow));
document.querySelectorAll("[data-phone-card]").forEach((a) => (a.href = "tel:+" + CONFIG.whatsapp));
document.getElementById("powered").href = CONFIG.poweredUrl;

/* formlar: WhatsApp'ta hazır mesaj açar */
document.querySelectorAll("form[data-form]").forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const text =
      "Merhaba, sigorta teklifi almak istiyorum.\n" +
      "Ad Soyad: " + String(f.get("ad")).trim() + "\n" +
      "Telefon: " + String(f.get("tel")).trim() + "\n" +
      "Sigorta türü: " + f.get("tur") + "\n" +
      "Not: " + (f.get("not") || "-");
    const w = window.open(waLink(text), "_blank", "noopener");
    if (!w) window.location.href = waLink(text);
  });
});

/* ürün kartındaki "Teklif al" hızlı formda türü seçer */
document.querySelectorAll("[data-pick]").forEach((a) => {
  a.addEventListener("click", () => {
    const r = document.querySelector('#teklif input[name="tur"][value="' + a.dataset.pick + '"]');
    if (r) r.checked = true;
    const sel = document.getElementById("d-tur");
    if (sel) sel.value = a.dataset.pick;
  });
});

/* belirme animasyonu */
const rv = document.querySelectorAll(".rv");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  rv.forEach((el, i) => { el.style.transitionDelay = (i % 3) * 70 + "ms"; io.observe(el); });
} else {
  rv.forEach((el) => el.classList.add("in"));
}

/* mobil menü */
const burger = document.querySelector(".burger");
const menu = document.getElementById("menu");
if (burger && menu) {
  burger.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
  });
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
    menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false");
  }));
}
