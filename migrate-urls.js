/**
 * Tazecicek → İstanbul Çiçekleri URL Migration Script
 * ─────────────────────────────────────────────
 * Bu script src/ altındaki tüm .js ve .tsx dosyalarında
 * hardcoded tazecicek URL'lerini merkezi config import'larıyla değiştirir.
 * 
 * KULLANIM: node migrate-urls.js
 * ÖNCESİNDE: git commit ile mevcut durumu yedekleyin
 */

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════
// REPLACEMENT RULES
// ═══════════════════════════════════════════════════

const URL_REPLACEMENTS = [
  // ─── Auth API ─────────────────────────────────
  { from: `'https://apiauth.tazecicek.com/api/Auth/login'`, to: `urls.login` },
  { from: `'https://apiauth.tazecicek.com/api/Auth/register'`, to: `urls.register` },
  { from: `'https://apiauth.tazecicek.com/api/Auth/refresh'`, to: `urls.refresh` },
  { from: `'https://apiauth.tazecicek.com/api/SosyalGiris/SosyalLogin'`, to: `urls.sosyalLogin` },
  { from: `'https://apiauth.tazecicek.com/api/UyeUpdate/UpdatePassword'`, to: `urls.updatePassword` },
  { from: `'https://apiauth.tazecicek.com/api/UyeUpdate/UpdatePassword/'`, to: `urls.updatePassword` },
  { from: `'https://apiauth.tazecicek.com/api/UyeUpdate/UpdateUye/'`, to: `urls.updateUye` },
  { from: `'https://apiauth.tazecicek.com/api/UyeUpdate/DeleteUser'`, to: `urls.deleteUser` },
  { from: `'https://apiauth.tazecicek.com/api/UyeUpdate/SendPasswordResetEmail'`, to: `urls.sendPasswordReset` },
  { from: `'https://apiauth.tazecicek.com/api/UyeUpdate/UyeCihazTokenGuncelle'`, to: `urls.cihazToken` },
  { from: `'https://apiauth.tazecicek.com/api/UyeUpdate/UyeCihazTokenGuncelle/'`, to: `urls.cihazToken` },

  // ─── Frontend API ─────────────────────────────
  { from: `'https://apifrontend.tazecicek.com/api/'`, to: '`${API_CONFIG.frontendApi}/api/`' },
  { from: `'https://apifrontend.tazecicek.com/api/Home/'`, to: '`${API_CONFIG.frontendApi}/api/Home/`' },
  { from: `'https://apifrontend.tazecicek.com/api/product/urunler'`, to: `urls.urunler` },
  { from: `'https://apifrontend.tazecicek.com/api/Product/Urun2026'`, to: `urls.urun2026` },
  { from: `'https://apifrontend.tazecicek.com/api/Product/kategoriler'`, to: `urls.kategoriler` },
  { from: `'https://apifrontend.tazecicek.com/api/Product/benzerurunler'`, to: `urls.benzerUrunler` },
  { from: `'https://apifrontend.tazecicek.com/api/Product/resolvePermalink'`, to: `urls.resolvePermalink` },
  { from: `'https://apifrontend.tazecicek.com/api/kargoIndirimLimit/'`, to: `urls.kargoIndirimLimit` },
  { from: `'https://apifrontend.tazecicek.com/api/SepeteEkle/'`, to: `urls.sepeteEkle` },
  { from: `'https://apifrontend.tazecicek.com/api/ceviriler/'`, to: `urls.ceviriler` },
  { from: `'https://apifrontend.tazecicek.com/api/Home/blocks'`, to: `urls.blocks` },
  { from: `'https://apifrontend.tazecicek.com/api/Home/HatirlatmaEkle'`, to: `urls.hatirlatmaEkle` },
  { from: `'https://apifrontend.tazecicek.com/api/Home/HatirlatmaListele'`, to: `urls.hatirlatmaListele` },
  { from: `'https://apifrontend.tazecicek.com/api/Home/HatirlatmaSil'`, to: `urls.hatirlatmaSil` },
  { from: `'https://apifrontend.tazecicek.com/api/Home/appVersion'`, to: `urls.appVersion` },
  { from: `'https://apifrontend.tazecicek.com/api/Ota'`, to: `urls.otaBase` },

  // ─── Basket API ───────────────────────────────
  { from: `'https://apibasket.tazecicek.com/api/SepetView/sepetizle/'`, to: `urls.sepetIzle` },
  { from: `'https://apibasket.tazecicek.com/api/SepetView/sepetindirim/'`, to: `urls.sepetIndirim` },
  { from: `'https://apibasket.tazecicek.com/api/SepetView/sepetupdate/'`, to: `urls.sepetUpdate` },
  { from: `'https://apibasket.tazecicek.com/api/SepetView/KartNotUpdate/'`, to: `urls.kartNotUpdate` },
  { from: `'https://apibasket.tazecicek.com/api/SepetView/indirimsil/'`, to: `urls.indirimSil` },
  { from: `'https://apibasket.tazecicek.com/api/SepetEkle/SepetSaatGuncelle'`, to: `urls.sepetSaatGuncelle` },
  { from: `'https://apibasket.tazecicek.com/api/Home/teslimGunSayisi/'`, to: `urls.teslimGunSayisi` },
  { from: `'https://apibasket.tazecicek.com/api/Home/teslimSaatleri/'`, to: `urls.teslimSaatleri` },
  { from: `'https://apibasket.tazecicek.com/api/Home/gunKapatListUrun'`, to: `urls.gunKapatListUrun` },
  { from: `'https://apibasket.tazecicek.com/api/Adresler/teslimAdreslerim/'`, to: `urls.teslimAdreslerim` },
  { from: `'https://apibasket.tazecicek.com/api/Adresler/Adreslerim/'`, to: `urls.adreslerim` },
  { from: `'https://apibasket.tazecicek.com/api/SepetOdeme/AdresEkle'`, to: `urls.adresEkle` },
  { from: `'https://apibasket.tazecicek.com/api/Adresler/AdresGuncelle'`, to: `urls.adresGuncelle` },
  { from: `'https://apibasket.tazecicek.com/api/Adresler/AdresGuncelle/'`, to: `urls.adresGuncelle` },
  { from: `'https://apibasket.tazecicek.com/api/Adresler/AdresSil'`, to: `urls.adresSil` },
  { from: `'https://apibasket.tazecicek.com/api/Adresler/AdresSil/'`, to: `urls.adresSil` },
  { from: `'https://apibasket.tazecicek.com/api/Adresler/Favorilerim/'`, to: `urls.favorilerim` },
  { from: `'https://apibasket.tazecicek.com/api/Adresler/FavoriEkle/'`, to: `urls.favoriEkle` },
  { from: `'https://apibasket.tazecicek.com/api/Adresler/MesajAt/'`, to: `urls.mesajAt` },
  { from: `'https://apibasket.tazecicek.com/api/Adresler/kredikartlarim/'`, to: `urls.kredikartlarim` },
  { from: `'https://apibasket.tazecicek.com/api/Adresler/KartSil/'`, to: `urls.kartSil` },
  { from: `'https://apibasket.tazecicek.com/api/Siparisler/SiparisList/'`, to: `urls.siparisList` },
  { from: `'https://apibasket.tazecicek.com/api/Siparisler/Siparis/'`, to: `urls.siparis` },
  { from: `'https://apibasket.tazecicek.com/api/SepetOdeme/SanalPosOdeme'`, to: `urls.sanalPosOdeme` },
  { from: `'https://apibasket.tazecicek.com/api/SepetOdeme/Bankalar/'`, to: `urls.bankalar` },
  { from: `'https://apibasket.tazecicek.com/api/SepetOdeme/SiparisTamamlaHavale/'`, to: `urls.siparisHavale` },
  
  // ─── Location API ─────────────────────────────
  { from: `'https://loc.tazecicek.com/mahalle7.ashx'`, to: `urls.mahalleSec` },

  // ─── OTA/Version ──────────────────────────────
  { from: `'https://apifrontend.tazecicek.com/api/Home/appVersion'`, to: `urls.appVersion` },
];

// Template literal URL replacements (backtick strings)
const TEMPLATE_REPLACEMENTS = [
  { pattern: /`https:\/\/apibasket\.tazecicek\.com\/api\/SepetView\/sepetitemsil\?/g, replacement: '`${urls.sepetItemSil}?' },
  { pattern: /`https:\/\/apibasket\.tazecicek\.com\/api\/SepetView\/sepetizle\/`/g, replacement: '`${urls.sepetIzle}`' },
  { pattern: /`https:\/\/apibasket\.tazecicek\.com\/api\/Siparisler\/Siparis\/`/g, replacement: '`${urls.siparis}`' },
  { pattern: /`https:\/\/apibasket\.tazecicek\.com\/api\/Siparisler\/SiparisList\/`/g, replacement: '`${urls.siparisList}`' },
  { pattern: /`https:\/\/apiauth\.tazecicek\.com\/api\/UyeUpdate\/UpdateUye\/`/g, replacement: '`${urls.updateUye}`' },
  { pattern: /`https:\/\/apibasket\.tazecicek\.com\/api\/Adresler\/Favorilerim\/`/g, replacement: '`${urls.favorilerim}`' },
  { pattern: /`https:\/\/apibasket\.tazecicek\.com\/api\/Adresler\/FavoriEkle\/`/g, replacement: '`${urls.favoriEkle}`' },
  { pattern: /`https:\/\/apibasket\.tazecicek\.com\/api\/SepetView\/sepetindirim\/`/g, replacement: '`${urls.sepetIndirim}`' },
  { pattern: /`https:\/\/apibasket\.tazecicek\.com\/api\/SepetView\/KartNotUpdate\/`/g, replacement: '`${urls.kartNotUpdate}`' },
  { pattern: /`https:\/\/apibasket\.tazecicek\.com\/api\/SepetView\/indirimsil\/`/g, replacement: '`${urls.indirimSil}`' },
];

// WebView URL replacements
const WEBVIEW_REPLACEMENTS = [
  { pattern: /`https:\/\/www\.tazecicek\.com\/ucdsend\?c=`\s*\+\s*(\w+)/g, replacement: '`${urls.ucdsend($1)}`' },
  { pattern: /'https:\/\/www\.tazecicek\.com\/sayfahtml\?url=([^'&]+)&lang='\s*\+\s*(\w+)/g, replacement: '`${urls.sayfaHtml(\'$1\', $2)}`' },
  { pattern: /'https:\/\/www\.tazecicek\.com\/sayfahtml\?url=([^']+)'/g, replacement: '`${urls.sayfaHtml(\'$1\')}`' },
  { pattern: /'https:\/\/www\.tazecicek\.com\/ozelgun\/kapatgun\.png'/g, replacement: 'urls.kapatgunImage' },
];

// ═══════════════════════════════════════════════════
// IMPORT MANAGEMENT
// ═══════════════════════════════════════════════════

function ensureImports(content, filePath) {
  const relativeConfig = getRelativePath(filePath, 'config/apiConfig');
  const relativeUrls = getRelativePath(filePath, 'config/apiUrls');
  
  let modified = content;
  let needsConfig = content.includes('API_CONFIG.');
  let needsUrls = content.includes('urls.');
  
  // Check if imports already exist
  const hasConfigImport = content.includes("from '../config/apiConfig'") || content.includes("from './apiConfig'");
  const hasUrlsImport = content.includes("from '../config/apiUrls'") || content.includes("from './apiUrls'");
  
  if (needsConfig && !hasConfigImport) {
    modified = `import API_CONFIG from '${relativeConfig}';\n` + modified;
  }
  
  if (needsUrls && !hasUrlsImport) {
    // Add after last import or at top
    const lastImportIdx = modified.lastIndexOf('\nimport ');
    if (lastImportIdx !== -1) {
      const endOfLine = modified.indexOf('\n', lastImportIdx + 1);
      modified = modified.slice(0, endOfLine + 1) + `import { urls } from '${relativeUrls}';\n` + modified.slice(endOfLine + 1);
    } else {
      modified = `import { urls } from '${relativeUrls}';\n` + modified;
    }
  }
  
  return modified;
}

function getRelativePath(filePath, target) {
  if (filePath.includes('/screens/') || filePath.includes('/components/') || filePath.includes('/utils/')) {
    return `../config/${target.split('/').pop()}`;
  }
  return `./${target.split('/').pop()}`;
}

// ═══════════════════════════════════════════════════
// PROCESSING
// ═══════════════════════════════════════════════════

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  let changeCount = 0;
  
  // Skip already-processed files (Auth.js etc.)
  if (filePath.includes('/config/')) return { changes: 0 };
  
  // 1. Simple string replacements
  for (const rule of URL_REPLACEMENTS) {
    if (content.includes(rule.from)) {
      content = content.split(rule.from).join(rule.to);
      changeCount++;
    }
  }
  
  // 2. Template literal replacements
  for (const rule of TEMPLATE_REPLACEMENTS) {
    if (rule.pattern.test(content)) {
      content = content.replace(rule.pattern, rule.replacement);
      changeCount++;
    }
    // Reset regex lastIndex
    rule.pattern.lastIndex = 0;
  }
  
  // 3. Dynamic URL patterns (codeverVeSiparisSiparisYENI)
  const codeverPattern = /['"`]https:\/\/apifrontend\.tazecicek\.com\/api\/codeverVeSiparisSiparisYENI\/['"`]\s*\+\s*(\w+)/g;
  if (codeverPattern.test(content)) {
    codeverPattern.lastIndex = 0;
    content = content.replace(codeverPattern, '`${urls.codeverVeSiparis($1)}`');
    changeCount++;
  }
  
  // 4. kartnotlar with dynamic lang
  const kartNotlarPattern = /['"`]https:\/\/apifrontend\.tazecicek\.com\/api\/Home\/kartnotlar\/(\w+)\/['"`]/g;
  if (kartNotlarPattern.test(content)) {
    kartNotlarPattern.lastIndex = 0;
    content = content.replace(kartNotlarPattern, (match, lang) => {
      if (lang === 'TR' || lang === 'EN') return `urls.kartNotlar('${lang}')`;
      return `urls.kartNotlar(${lang})`;
    });
    changeCount++;
  }
  // Also handle template literal version
  content = content.replace(/`https:\/\/apifrontend\.tazecicek\.com\/api\/Home\/kartnotlar\/\$\{([^}]+)\}\/`/g, 'urls.kartNotlar($1)');
  
  // 5. Remaining apifrontend base URL pattern
  content = content.replace(/'https:\/\/apifrontend\.tazecicek\.com\/api\//g, '`${API_CONFIG.frontendApi}/api/');
  content = content.replace(/`https:\/\/apifrontend\.tazecicek\.com\/api\//g, '`${API_CONFIG.frontendApi}/api/');
  
  // 6. Remaining apibasket base URL pattern
  content = content.replace(/'https:\/\/apibasket\.tazecicek\.com\/api\//g, '`${API_CONFIG.basketApi}/api/');
  content = content.replace(/`https:\/\/apibasket\.tazecicek\.com\/api\//g, '`${API_CONFIG.basketApi}/api/');
  
  // 7. Remaining apiauth base URL pattern
  content = content.replace(/'https:\/\/apiauth\.tazecicek\.com\/api\//g, '`${API_CONFIG.authApi}/api/');
  content = content.replace(/`https:\/\/apiauth\.tazecicek\.com\/api\//g, '`${API_CONFIG.authApi}/api/');
  
  // 8. www.tazecicek.com references (WebView, product URLs, sharing)
  content = content.replace(/'https:\/\/www\.tazecicek\.com\//g, '`${API_CONFIG.webBaseUrl}/');
  content = content.replace(/`https:\/\/www\.tazecicek\.com\//g, '`${API_CONFIG.webBaseUrl}/');
  content = content.replace(/'https:\/\/www\.tazecicek\.com'/g, 'API_CONFIG.webBaseUrl');
  
  // 9. SipayKomisyon removal (just comment it out, don't break code structure)
  content = content.replace(/`https:\/\/www\.tazecicek\.com\/SipayKomisyon_axios\.ashx`/g, "'' // SipayKomisyon kaldırıldı - geçersiz endpoint");
  
  // 10. loc.tazecicek.com
  content = content.replace(/'https:\/\/loc\.tazecicek\.com\/mahalle7\.ashx'/g, 'API_CONFIG.locationApi');
  
  // 11. Remaining www.tazecicek.com in comments
  content = content.replace(/https:\/\/www\.tazecicek\.com/g, '${API_CONFIG.webBaseUrl}');
  
  // 12. Add imports if needed
  if (content !== originalContent) {
    content = ensureImports(content, filePath);
    changeCount++;
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return { changes: changeCount };
  }
  
  return { changes: 0 };
}

// ═══════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════

function walkDir(dir, extensions) {
  const results = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (item === 'node_modules' || item === '.git' || item === 'config') continue;
      results.push(...walkDir(fullPath, extensions));
    } else if (extensions.some(ext => item.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  
  return results;
}

const srcDir = path.join(__dirname, 'src');
const files = walkDir(srcDir, ['.js', '.tsx', '.ts', '.jsx']);

console.log(`\nProcessing ${files.length} files...\n`);

let totalChanges = 0;
const changedFiles = [];

for (const file of files) {
  const result = processFile(file);
  if (result.changes > 0) {
    const relPath = path.relative(__dirname, file);
    changedFiles.push(relPath);
    totalChanges += result.changes;
    console.log(`  ✅ ${relPath} (${result.changes} changes)`);
  }
}

console.log(`\n═══════════════════════════════════════`);
console.log(`Total: ${changedFiles.length} files modified, ${totalChanges} change groups`);
console.log(`═══════════════════════════════════════\n`);

// Verify remaining references
const { execSync } = require('child_process');
try {
  const remaining = execSync(`grep -rn "tazecicek" --include="*.js" --include="*.tsx" src/ | grep -v "node_modules" | grep -v "// legacy" | grep -v "// SipayKomisyon" | wc -l`, { cwd: __dirname }).toString().trim();
  console.log(`Remaining "tazecicek" references in src/: ${remaining}`);
  
  if (parseInt(remaining) > 0) {
    console.log(`\n⚠️  Remaining references that need manual review:`);
    const lines = execSync(`grep -rn "tazecicek" --include="*.js" --include="*.tsx" src/ | grep -v "node_modules" | grep -v "// legacy" | grep -v "// SipayKomisyon"`, { cwd: __dirname }).toString();
    console.log(lines);
  }
} catch (e) {
  // grep returns exit code 1 when no matches (good!)
  console.log(`✅ No remaining "tazecicek" references!`);
}
