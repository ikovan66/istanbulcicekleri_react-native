/**
 * DynamicIcon — Renders SVG icons fetched from the Next.js API
 * 
 * Icons are fetched once at app startup and cached in memory + AsyncStorage.
 * When a tenant customizes icons in the admin panel, the app picks up
 * the changes on next launch (or pull-to-refresh).
 * 
 * Usage:
 *   import DynamicIcon from '../components/DynamicIcon';
 *   <DynamicIcon name="home" size={22} color="#2D3E50" />
 *   <DynamicIcon name="heart" size={22} color="red" />
 */

import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_CONFIG from '../config/apiConfig';

const ICONS_CACHE_KEY = '@dynamic_icons_cache_v3';
const ICONS_API_URL = `https://${API_CONFIG.universalDomain}/api/mobile/icons?domain=${API_CONFIG.universalDomain}`;

// In-memory icon cache (instant access after first load)
let iconsCache = null;
let iconColor = null;
let fetchPromise = null;

/**
 * Apply color to SVG XML string
 */
function colorizeSvg(svgXml, color) {
  if (!svgXml || !color) return svgXml;
  let svg = svgXml;
  svg = svg.replace(/fill="black"/g, `fill="${color}"`);
  svg = svg.replace(/stroke="black"/g, `stroke="${color}"`);
  return svg;
}

/**
 * Fetch icons from API and cache them
 */
async function loadIcons() {
  // Return existing cache
  if (iconsCache) return iconsCache;

  // Deduplicate concurrent fetches
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    // Try AsyncStorage first
    try {
      const cached = await AsyncStorage.getItem(ICONS_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        iconsCache = parsed.icons || {};
        iconColor = parsed.iconColor || null;
        return iconsCache;
      }
    } catch (e) {
      // ignore cache read errors
    }

    // Fetch from API
    try {
      const response = await fetch(ICONS_API_URL, {
        headers: { 'Accept': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        iconsCache = data.icons || {};
        iconColor = data.iconColor || null;

        // Cache to AsyncStorage for next launch
        await AsyncStorage.setItem(
          ICONS_CACHE_KEY,
          JSON.stringify({ icons: iconsCache, iconColor, ts: Date.now() })
        );

        return iconsCache;
      }
    } catch (e) {
      console.log('[DynamicIcon] API fetch failed:', e.message);
    }

    // Fallback: empty cache
    iconsCache = {};
    return iconsCache;
  })();

  const result = await fetchPromise;
  fetchPromise = null;
  return result;
}

/**
 * Force refresh icons from API (e.g. on pull-to-refresh)
 */
export async function refreshIcons() {
  iconsCache = null;
  fetchPromise = null;
  await AsyncStorage.removeItem(ICONS_CACHE_KEY);
  return loadIcons();
}

/**
 * Pre-load icons at app startup (call this in App.js or similar)
 */
export function preloadIcons() {
  loadIcons().catch(() => {});
}

/**
 * DynamicIcon Component
 * 
 * @param {string} name - Icon name (e.g. "home", "heart", "account", "bag")  
 * @param {number} size - Icon size in pixels (default: 22)
 * @param {string} color - Override color (replaces "black" in SVG)
 * @param {object} style - Additional style props
 */
const DynamicIcon = ({ name, size = 22, color, style }) => {
  const [svgXml, setSvgXml] = useState(null);

  useEffect(() => {
    let mounted = true;

    loadIcons().then((icons) => {
      if (!mounted) return;
      const xml = icons[name];
      if (xml) {
        // Use component color, fallback to tenant global color
        const effectiveColor = color || iconColor || null;
        setSvgXml(colorizeSvg(xml, effectiveColor));
      }
    });

    return () => { mounted = false; };
  }, [name, color]);

  if (!svgXml) {
    // Invisible placeholder while loading
    return <View style={[{ width: size, height: size }, style]} />;
  }

  return (
    <SvgXml
      xml={svgXml}
      width={size}
      height={size}
      style={style}
    />
  );
};

export default DynamicIcon;
