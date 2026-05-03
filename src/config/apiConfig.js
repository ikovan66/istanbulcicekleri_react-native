/**
 * Merkezi Uygulama Konfigürasyonu
 * ─────────────────────────────────────────────────────
 * Tüm firma-spesifik değerler bu dosyada toplanmıştır.
 * Klonlama: Yeni firma için sadece bu dosyadaki değerleri değiştirin.
 * ─────────────────────────────────────────────────────
 */

const API_CONFIG = {
  // ─── Tenant ────────────────────────────────────────
  // .NET Core API'lerinde X-Tenant-Db header ile gönderilir.
  // Backend'de TenantService bu değere göre veritabanı seçer.
  tenantDb: 'istanbulcicekleri',

  // ─── API Base URL'ler (Ikost Multi-Tenant) ─────────
  // Tüm tenant'lar aynı API sunucularını kullanır,
  // X-Tenant-Db header'ı ile veritabanı ayrışır.
  authApi:     'https://api-auth.ikost.com',
  frontendApi: 'https://api-frontend.ikost.com',
  basketApi:   'https://api-basket.ikost.com',

  // ─── Lokasyon API ──────────────────────────────────
  locationApi: 'https://conn.ikost.com/mahalle7.ashx',

  // ─── Web Site (WebView sayfaları için) ─────────────
  // Mesafeli satış sözleşmesi, 3D Secure, mesajlar vb.
  webBaseUrl: 'https://www.istanbulcicekleri.com',

  // ─── NJ API (Mobile Payment) ────────────────────────
  // Next.js mobile endpoint'leri (ödeme, taksit vb.)
  nextjsBaseUrl: 'https://www.istanbulcicekleri.com',

  // ─── CDN ───────────────────────────────────────────
  cdnBaseUrl: 'https://cdn.ikost.com',

  // ─── Deep Link Scheme ──────────────────────────────
  // Android: AndroidManifest.xml'de de tanımlı olmalı
  // iOS: Info.plist'te de tanımlı olmalı
  appScheme:       'istanbulcicekleri',
  insiderScheme:   'insideristanbulcicekleri',
  universalDomain: 'www.istanbulcicekleri.com',

  // ─── Insider SDK ───────────────────────────────────
  // enabled: false → hiçbir Insider çağrısı yapılmaz
  // enabled: true  → SDK başlatılır, event'ler gönderilir
  insider: {
    enabled:     false,
    partnerName: 'istanbulcicekleri',
    appGroupId:  'group.insider.com.istanbulcicekleri.mobileapp.istanbulCicekleri',
  },

  // ─── App Bilgileri ─────────────────────────────────
  appName:     'İstanbul Çiçekleri',
  appEmail:    'info@istanbulcicekleri.com',
  defaultLogo: 'https://cdn.ikost.com/istanbulcicekleri/logo.png',

  // ─── Store URL'ler (Force Update) ──────────────────
  storeUrls: {
    ios:     'https://apps.apple.com/app/istanbul-cicekleri/id...',
    android: 'https://play.google.com/store/apps/details?id=com.istanbulcicekleri.mobileapp.istanbulCicekleri',
  },
};

export default API_CONFIG;
