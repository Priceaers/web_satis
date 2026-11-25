/* ===== TEK YERDEN AYAR: gerçek bilgileri burada değiştirin ===== */
const CONFIG = {
  whatsapp: "905000000000",       // ÖRNEK: ülke kodu ile, + ve boşluk olmadan
  phoneShow: "0500 000 00 00",    // ÖRNEK: sitede görünen telefon
  poweredUrl: "https://envarsigorta.com" // "Powered by Fahrettin Group" tıklanınca gidecek adres
};

const waLink = (text) =>
  "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(text);
const HELLO = "Merhaba, Asil Sigorta web sitesinden yazıyorum. Sigorta teklifi almak istiyorum.";

document.querySelectorAll("[data-wa]").forEach((a) => {
  a.href = waLink(HELLO);
  a.target = "_blank";
  a.rel = "noopener";
});
document.querySelectorAll("[data-phone]").forEach((a) => {
  a.textContent = CONFIG.phoneShow;
  a.href = "tel:+" + CONFIG.whatsapp;
});
document.getElementById("powered").href = CONFIG.poweredUrl;

document.getElementById("teklif-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const f = new FormData(this);
  const text =
    "Merhaba, sigorta teklifi almak istiyorum.\n" +
    "Ad Soyad: " + f.get("ad") + "\n" +
    "Telefon: " + f.get("tel") + "\n" +
    "Sigorta türü: " + f.get("tur") + "\n" +
    "Not: " + (f.get("not") || "-");
  window.open(waLink(text), "_blank", "noopener");
});

/* belirme animasyonu */
const rv = document.querySelectorAll(".rv");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  rv.forEach((el, i) => { el.style.transitionDelay = (i % 3) * 80 + "ms"; io.observe(el); });
} else {
  rv.forEach((el) => el.classList.add("in"));
}

/* cam yüzeylerde imleci izleyen ışık */
document.querySelectorAll(".glass").forEach((el) => {
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", e.clientX - r.left + "px");
    el.style.setProperty("--my", e.clientY - r.top + "px");
  });
});
