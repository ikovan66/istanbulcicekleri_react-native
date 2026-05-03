/**
 * Price Formatter Utility
 * ─────────────────────────────────────────────────────
 * NJ'deki formatPrice pattern'inin aynısı.
 * Backend fiyatları her zaman TL bazındadır.
 * Seçilen kura göre parite ile bölerek dönüştürür.
 * ─────────────────────────────────────────────────────
 */

/**
 * Fiyatı aktif kura göre formatlar
 * @param {number|string} price - TL bazında fiyat (backend'den gelen)
 * @param {object} activeCurrency - { parite, sembol, kurad }
 * @returns {string} Formatlanmış fiyat string'i (örn: "25,00 €" veya "150,00 TL")
 */
export function formatPrice(price, activeCurrency) {
  if (price == null || price === '') return '';

  const parite = activeCurrency?.parite || 1;
  const sembol = activeCurrency?.sembol || 'TL';

  const numPrice = parseFloat(price) / parite;

  if (isNaN(numPrice)) return '';

  // Türkçe format: nokta binlik ayırıcı, virgül ondalık ayırıcı
  const formatted = numPrice.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${formatted} ${sembol}`;
}

/**
 * Yüzde indirimi hesaplar (mevcut yuzde fonksiyonunun kur-bağımsız versiyonu)
 * @param {number} fiyat - İndirimli fiyat
 * @param {number} fiyatindirimsiz - İndirimsiz fiyat
 * @returns {string} Yüzde string'i (örn: "%25") veya boş string
 */
export function yuzdeIndirim(fiyat, fiyatindirimsiz) {
  if (!fiyatindirimsiz || fiyatindirimsiz <= 0 || fiyatindirimsiz <= fiyat) return '';
  const yuzde = Math.round(((fiyatindirimsiz - fiyat) / fiyatindirimsiz) * 100);
  return `%${yuzde}`;
}

/**
 * Backend'den gelen fiyat string'ini (örn: "150.00 TL") kur dönüştürmeleriyle yeniden formatlar
 * @param {string} fiyatString - Backend fiyat string'i (örn: "150.00 TL")
 * @param {number} fiyatNumeric - Sayısal fiyat değeri (TL bazında)
 * @param {object} activeCurrency - { parite, sembol, kurad }
 * @returns {string} Dönüştürülmüş fiyat string'i
 */
export function convertPriceString(fiyatString, fiyatNumeric, activeCurrency) {
  // Kur varsayılan (TL, parite=1) ise orijinal string'i döndür
  if (!activeCurrency || activeCurrency.parite === 1) {
    return fiyatString || '';
  }

  // Sayısal değer varsa onu kullan, yoksa string'den parse et
  let numValue = fiyatNumeric;
  if (numValue == null && fiyatString) {
    const cleaned = fiyatString.replace(/[^\d.,]/g, '').replace(',', '.');
    numValue = parseFloat(cleaned);
  }

  if (numValue == null || isNaN(numValue)) return fiyatString || '';

  return formatPrice(numValue, activeCurrency);
}
