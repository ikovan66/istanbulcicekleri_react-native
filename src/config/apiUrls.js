/**
 * Merkezi API URL Kataloğu
 * ─────────────────────────────────────────────────────
 * Tüm API endpoint'leri burada tanımlıdır.
 * Ekranlarda hardcoded URL yerine bu modül import edilir.
 * ─────────────────────────────────────────────────────
 */

import API_CONFIG from './apiConfig';

export const urls = {
  // ═══════════════════════════════════════════════════
  // AUTH API  (api-auth.ikost.com)
  // ═══════════════════════════════════════════════════
  login:              `${API_CONFIG.authApi}/api/Auth/login`,
  register:           `${API_CONFIG.authApi}/api/Auth/register`,
  refresh:            `${API_CONFIG.authApi}/api/Auth/refresh`,
  sosyalLogin:        `${API_CONFIG.authApi}/api/SosyalGiris/SosyalLogin`,
  updatePassword:     `${API_CONFIG.authApi}/api/UyeUpdate/UpdatePassword`,
  updateUye:          `${API_CONFIG.authApi}/api/UyeUpdate/UpdateUye`,
  deleteUser:         `${API_CONFIG.authApi}/api/UyeUpdate/DeleteUser`,
  sendPasswordReset:  `${API_CONFIG.authApi}/api/UyeUpdate/SendPasswordResetEmail`,
  cihazToken:         `${API_CONFIG.authApi}/api/UyeUpdate/UyeCihazTokenGuncelle`,
  orderSummary:       `${API_CONFIG.authApi}/api/OrderSummary`,

  // ═══════════════════════════════════════════════════
  // FRONTEND API  (api-frontend.ikost.com)
  // ═══════════════════════════════════════════════════
  frontendBase:       `${API_CONFIG.frontendApi}/api`,
  urunler:            `${API_CONFIG.frontendApi}/api/product/urunler`,
  urun2026:           `${API_CONFIG.frontendApi}/api/Product/Urun2026`,
  kategoriler:        `${API_CONFIG.frontendApi}/api/Product/kategoriler`,
  benzerUrunler:      `${API_CONFIG.frontendApi}/api/Product/benzerurunler`,
  resolvePermalink:   `${API_CONFIG.frontendApi}/api/Product/resolvePermalink`,
  kargoIndirimLimit:  `${API_CONFIG.frontendApi}/api/kargoIndirimLimit`,
  codeverVeSiparis:   (os) => `${API_CONFIG.frontendApi}/api/codeverVeSiparisSiparisYENI/${os}`,
  sepeteEkle:         `${API_CONFIG.frontendApi}/api/SepeteEkle`,
  ceviriler:          `${API_CONFIG.frontendApi}/api/ceviriler`,
  blocks:             `${API_CONFIG.frontendApi}/api/Home/blocks`,
  kartNotlar:         (lang) => `${API_CONFIG.frontendApi}/api/Home/kartnotlar/${lang}/`,
  hatirlatmaEkle:     `${API_CONFIG.frontendApi}/api/Home/HatirlatmaEkle`,
  hatirlatmaListele:  `${API_CONFIG.frontendApi}/api/Home/HatirlatmaListele`,
  hatirlatmaSil:      `${API_CONFIG.frontendApi}/api/Home/HatirlatmaSil`,
  appVersion:         `${API_CONFIG.frontendApi}/api/Home/appVersion`,
  otaBase:            `${API_CONFIG.frontendApi}/api/Ota`,
  sitemapUrunler:     `${API_CONFIG.frontendApi}/api/Sitemap/urunler`,

  // ═══════════════════════════════════════════════════
  // BASKET API  (api-basket.ikost.com)
  // ═══════════════════════════════════════════════════
  sepetIzle:          `${API_CONFIG.basketApi}/api/SepetView/sepetizle/`,
  sepetIndirim:       `${API_CONFIG.basketApi}/api/SepetView/sepetindirim/`,
  sepetUpdate:        `${API_CONFIG.basketApi}/api/SepetView/sepetupdate/`,
  sepetItemSil:       `${API_CONFIG.basketApi}/api/SepetView/sepetitemsil`,
  indirimSil:         `${API_CONFIG.basketApi}/api/SepetView/indirimsil/`,
  kartNotUpdate:      `${API_CONFIG.basketApi}/api/SepetView/KartNotUpdate/`,
  sepetSaatGuncelle:  `${API_CONFIG.basketApi}/api/SepetEkle/SepetSaatGuncelle`,
  teslimGunSayisi:    `${API_CONFIG.basketApi}/api/Home/teslimGunSayisi/`,
  teslimSaatleri:     `${API_CONFIG.basketApi}/api/Home/teslimSaatleri/`,
  gunKapatListUrun:   `${API_CONFIG.basketApi}/api/Home/gunKapatListUrun`,
  teslimAdreslerim:   `${API_CONFIG.basketApi}/api/Adresler/teslimAdreslerim/`,
  adreslerim:         `${API_CONFIG.basketApi}/api/Adresler/Adreslerim/`,
  adresEkle:          `${API_CONFIG.basketApi}/api/SepetOdeme/AdresEkle`,
  adresGuncelle:      `${API_CONFIG.basketApi}/api/Adresler/AdresGuncelle`,
  adresSil:           `${API_CONFIG.basketApi}/api/Adresler/AdresSil`,
  favorilerim:        `${API_CONFIG.basketApi}/api/Adresler/Favorilerim/`,
  favoriEkle:         `${API_CONFIG.basketApi}/api/Adresler/FavoriEkle/`,
  mesajAt:            `${API_CONFIG.basketApi}/api/Adresler/MesajAt/`,
  kredikartlarim:     `${API_CONFIG.basketApi}/api/Adresler/kredikartlarim/`,
  kartSil:            `${API_CONFIG.basketApi}/api/Adresler/KartSil/`,
  siparisList:        `${API_CONFIG.basketApi}/api/Siparisler/SiparisList/`,
  siparis:            `${API_CONFIG.basketApi}/api/Siparisler/Siparis/`,
  sanalPosOdeme:      `${API_CONFIG.basketApi}/api/SepetOdeme/SanalPosOdeme`,
  bankalar:           `${API_CONFIG.basketApi}/api/SepetOdeme/Bankalar/`,
  siparisHavale:      `${API_CONFIG.basketApi}/api/SepetOdeme/SiparisTamamlaHavale/`,

  // ═══════════════════════════════════════════════════
  // LOKASYON API
  // ═══════════════════════════════════════════════════
  mahalleSec:         API_CONFIG.locationApi,

  // ═══════════════════════════════════════════════════
  // WEB VIEW URL'LER
  // ═══════════════════════════════════════════════════
  ucdsend:            (code) => `${API_CONFIG.webBaseUrl}/ucdsend?c=${code}`,
  mesajlar:           (user, sipkod, oid, lang) =>
    `${API_CONFIG.webBaseUrl}/mesajlar?user=${user}&sipkod=${sipkod}&oid=${oid}&lang=${lang}`,
  sayfaHtml:          (url, lang) =>
    `${API_CONFIG.webBaseUrl}/sayfahtml?url=${url}${lang ? '&lang=' + lang : ''}`,
  kapatgunImage:      `${API_CONFIG.webBaseUrl}/ozelgun/kapatgun.png`,

  // ─── Product URL helper (sharing, Insider) ─────────
  productUrl:         (slug) => `${API_CONFIG.webBaseUrl}/${slug}`,

  // ═══════════════════════════════════════════════════
  // MOBILE PAYMENT (NJ Proxy → payment.ikost.com)
  // ═══════════════════════════════════════════════════
  mobilePayment:      `${API_CONFIG.nextjsBaseUrl}/api/mobile/payment`,
  mobilePaymentStatus:(orderId) => `${API_CONFIG.nextjsBaseUrl}/api/mobile/payment-status?orderId=${encodeURIComponent(orderId)}&domain=${API_CONFIG.webBaseUrl.replace(/^https?:\/\//, '').replace(/^www\./, '')}`,
  mobileInstallments: (amount) => `${API_CONFIG.nextjsBaseUrl}/api/mobile/installment-rates?domain=${API_CONFIG.webBaseUrl.replace(/^https?:\/\//, '').replace(/^www\./, '')}&amount=${amount}`,
  paymentDomain:      API_CONFIG.webBaseUrl.replace(/^https?:\/\//, '').replace(/^www\./, ''),
};

export default urls;
