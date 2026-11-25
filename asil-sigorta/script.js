// ÖRNEK numara: gerçek WhatsApp numarasıyla değiştirin (ülke kodu ile, + ve boşluk olmadan)
const WHATSAPP = "905000000000";
document.getElementById("teklif-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const f = new FormData(this);
  const msg =
    "Merhaba, sigorta teklifi almak istiyorum.%0A" +
    "Ad Soyad: " + encodeURIComponent(f.get("ad")) + "%0A" +
    "Telefon: " + encodeURIComponent(f.get("tel")) + "%0A" +
    "Sigorta türü: " + encodeURIComponent(f.get("tur")) + "%0A" +
    "Not: " + encodeURIComponent(f.get("not") || "-");
  window.open("https://wa.me/" + WHATSAPP + "?text=" + msg, "_blank", "noopener");
});
