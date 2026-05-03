---
description: OTA JS bundle oluşturma ve veritabanına kayıt
---

# OTA JS-Only Bundle Oluşturma

Bu workflow, sadece JavaScript içeren OTA bundle oluşturur (asset'siz).

// turbo-all

## Adımlar

### 1. Bundle Oluştur (Sadece JS)

```bash
cd /Users/murat/Tazecicek
npx react-native bundle --platform ios --dev false --entry-file index.js --bundle-output main.jsbundle
```

### 2. Zip Oluştur

```bash
cd /Users/murat/Tazecicek
zip ota_js_only_$(date +%Y%m%d_%H%M%S).zip main.jsbundle
```

### 3. Hash Hesapla

```bash
shasum -a 256 /Users/murat/Tazecicek/ota_js_only_*.zip | tail -1
```

Çıktı şöyle görünür:
```
811d67c7aab673382ea41cf6e94ceb1523c686d413ffc371c3f45b1f96ff9daf  /Users/murat/Tazecicek/ota_js_only_20251231_222845.zip
```

İlk kısım (hash), dosya adından önce gelen kısımdır.

### 4. Zip'i Sunucuya Yükle

Oluşturulan zip dosyasını sunucunuza yükleyin, örn:
- FTP ile `/ota/` klasörüne
- Veya API endpoint'inize upload

### 5. Veritabanına Kaydet

```sql
INSERT INTO OtaBundles (Version, Platform, BundlePath, Hash, IsMandatory, Description, IsActive)
VALUES (
    '1.0.X',                                      -- Version (her seferinde artır)
    'ios',                                        -- Platform
    'ota_js_only_YYYYMMDD_HHMMSS.zip',      -- BundlePath (sunucudaki yol)
    'HASH_BURAYA',                                -- Hash (3. adımdan)
    0,                                            -- IsMandatory: 0=opsiyonel, 1=zorunlu
    'Değişiklik açıklaması',                     -- Description
    1                                             -- IsActive
);
```

## Tek Satırda Tamamı (Inline Assets - Babel Plugin)

> **Önemli:** Bu komut `babel-plugin-inline-assets.js` ve `babel.config.js` yapılandırmasını kullanır. Resimler Babel derleme aşamasında base64 olarak koda gömülür. Metro asset sorunu yaşanmaz.

```bash
cd /Users/murat/Tazecicek && \
npx react-native bundle --platform ios --dev false --entry-file index.js --bundle-output main.jsbundle --reset-cache && \
ZIPNAME="ota_bundle_babel_$(date +%Y%m%d_%H%M%S).zip" && \
zip $ZIPNAME main.jsbundle && \
echo "Dosya: $ZIPNAME" && \
echo "Hash: $(shasum -a 256 $ZIPNAME | cut -d' ' -f1)"
```

## Notlar

- Asset (resim, ikon) değişikliklerinde App Store güncellemesi gerekir
- Sadece JavaScript kod değişiklikleri OTA ile gönderilebilir
- Version numarasını her bundle'da artırın
